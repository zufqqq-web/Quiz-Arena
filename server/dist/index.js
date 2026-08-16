import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { DEFAULT_QUIZZES } from './defaultQuizzes.js';
import { generateQuizQuestions, testAIProviderConnection } from './aiProvider.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
// Enable CORS for all frontend clients
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
// In-Memory storage of active game rooms
const rooms = new Map();
// In-Memory storage of shared quizzes library
const quizzesMap = new Map();
DEFAULT_QUIZZES.forEach((q) => quizzesMap.set(q.id, q));
// Sockets mapping for tracking user rooms
const socketRoomMap = new Map();
// Host tracking per room for race condition protection: roomCode -> { socketId, hostTabId }
const roomHostMap = new Map();
// Player tracking for reconnect handling: socketId -> { playerId, roomCode }
const socketPlayerMap = new Map();
// Grace period timers for disconnected players: `${roomCode}:${playerId}` -> Timeout
const disconnectGraceTimers = new Map();
// Helper to normalize room code
function normalizeRoomCode(code) {
    return String(code || '').trim().toUpperCase();
}
// ==========================================
// REST API Endpoints
// ==========================================
// Health Check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        activeRoomsCount: rooms.size,
        roomCodes: Array.from(rooms.keys()),
        quizzesCount: quizzesMap.size,
    });
});
// Shared Quizzes Library Endpoints
app.get('/api/quizzes', (_req, res) => {
    const allQuizzes = Array.from(quizzesMap.values());
    res.json(allQuizzes);
});
app.post('/api/quizzes', (req, res) => {
    try {
        const rawQuiz = req.body.quiz || req.body;
        if (!rawQuiz || !rawQuiz.title || !Array.isArray(rawQuiz.questions)) {
            res.status(400).json({ error: 'Invalid quiz data: "title" and "questions" array are required' });
            return;
        }
        const quiz = {
            id: rawQuiz.id || 'quiz-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            title: rawQuiz.title,
            description: rawQuiz.description || '',
            category: rawQuiz.category || 'Общий',
            coverEmoji: rawQuiz.coverEmoji || '🎯',
            questions: rawQuiz.questions,
            createdAt: rawQuiz.createdAt || Date.now(),
            updatedAt: Date.now(),
        };
        quizzesMap.set(quiz.id, quiz);
        console.log(`[Quiz API] Saved/Updated quiz: "${quiz.title}" (${quiz.id})`);
        res.json(quiz);
    }
    catch (err) {
        console.error(`[Quiz API] Error saving quiz:`, err.message || err);
        res.status(500).json({ error: err.message || 'Failed to save quiz' });
    }
});
app.delete('/api/quizzes/:id', (req, res) => {
    const id = String(req.params.id || '').trim();
    if (!id) {
        res.status(400).json({ error: 'Missing quiz ID' });
        return;
    }
    const existed = quizzesMap.delete(id);
    console.log(`[Quiz API] Deleted quiz ID ${id} (existed: ${existed})`);
    res.json({ success: true, id, deleted: existed });
});
// AI Quiz Generation Endpoint
app.post('/api/generate-quiz', async (req, res) => {
    try {
        const { topic, questionCount, difficulty, language, aiConfig } = req.body;
        if (!topic || typeof topic !== 'string') {
            res.status(400).json({ error: 'Missing or invalid "topic" parameter in request body' });
            return;
        }
        console.log(`[AI Generator] Request received for topic: "${topic}" (${questionCount || 5} questions, ${language || 'ru'})`);
        const questions = await generateQuizQuestions({
            topic,
            questionCount: Number(questionCount) || 5,
            difficulty: difficulty || 'medium',
            language: language || 'ru',
            aiConfig,
        });
        console.log(`[AI Generator] Successfully generated ${questions.length} questions for topic: "${topic}"`);
        res.json({ questions });
    }
    catch (err) {
        const statusCode = err.statusCode || 500;
        console.error(`[AI Generator] Error generating quiz:`, err.message || err);
        res.status(statusCode).json({
            error: err.message || 'Internal server error during AI quiz generation',
        });
    }
});
// Test AI Provider Connection Endpoint
app.post('/api/test-ai-connection', async (req, res) => {
    try {
        const { baseUrl, apiKey, model } = req.body;
        console.log(`[AI Test] Testing connection for model: ${model || 'default'} at base: ${baseUrl || 'default'}`);
        const result = await testAIProviderConnection({ baseUrl, apiKey, model });
        if (result.ok) {
            res.json({ ok: true, message: result.message });
        }
        else {
            res.status(400).json({ ok: false, error: result.message });
        }
    }
    catch (err) {
        console.error(`[AI Test] Error testing AI connection:`, err.message || err);
        res.status(500).json({ ok: false, error: err.message || 'Connection test failed' });
    }
});
// ==========================================
// Realtime Socket.IO Server Setup
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
});
io.on('connection', (socket) => {
    const socketId = socket.id;
    socketRoomMap.set(socketId, new Set());
    console.log(`[Socket.IO] Client connected: ${socketId}`);
    // Handle room joining
    socket.on('join_room', (roomCode, playerId) => {
        if (!roomCode)
            return;
        const cleanCode = normalizeRoomCode(roomCode);
        socket.join(cleanCode);
        socketRoomMap.get(socketId)?.add(cleanCode);
        if (playerId) {
            socketPlayerMap.set(socketId, { playerId, roomCode: cleanCode });
            // Cancel any pending disconnect grace timer
            const timerKey = `${cleanCode}:${playerId}`;
            if (disconnectGraceTimers.has(timerKey)) {
                clearTimeout(disconnectGraceTimers.get(timerKey));
                disconnectGraceTimers.delete(timerKey);
                console.log(`[Socket.IO] Cancelled disconnect grace timer for reconnected player: ${playerId}`);
            }
        }
        const roomSize = io.sockets.adapter.rooms.get(cleanCode)?.size || 0;
        console.log(`[Socket.IO] Socket ${socketId} joined room: ${cleanCode} (Total in room: ${roomSize})`);
        // If we have cached room state, provide it immediately to the client
        const cachedState = rooms.get(cleanCode);
        if (cachedState) {
            if (playerId && cachedState.players && cachedState.players[playerId]) {
                cachedState.players[playerId].connected = true;
                // Broadcast re-connected state
                io.to(cleanCode).emit('sync_message', {
                    type: 'HOST_STATE_UPDATE',
                    state: cachedState,
                });
            }
            else {
                socket.emit('sync_message', {
                    type: 'HOST_STATE_UPDATE',
                    state: cachedState,
                });
            }
        }
    });
    // Handle room leaving
    socket.on('leave_room', (roomCode) => {
        if (!roomCode)
            return;
        const cleanCode = normalizeRoomCode(roomCode);
        socket.leave(cleanCode);
        socketRoomMap.get(socketId)?.delete(cleanCode);
        console.log(`[Socket.IO] Socket ${socketId} left room: ${cleanCode}`);
    });
    // Universal Sync Message Relay
    socket.on('sync_message', (msg) => {
        if (!msg || !msg.type)
            return;
        let roomCode = '';
        if (msg.type === 'HOST_STATE_UPDATE' && msg.state?.roomCode) {
            roomCode = normalizeRoomCode(msg.state.roomCode);
            // Race condition protection: verify host authority
            const hostInfo = roomHostMap.get(roomCode);
            if (!hostInfo) {
                // Register initial host for room
                roomHostMap.set(roomCode, { socketId, hostTabId: msg.state.hostTabId });
                console.log(`[Socket.IO Host] Registered host for room ${roomCode}: socketId=${socketId}, hostTabId=${msg.state.hostTabId}`);
            }
            else {
                // Validate host identity
                if (msg.state.hostTabId && hostInfo.hostTabId && msg.state.hostTabId !== hostInfo.hostTabId) {
                    console.warn(`[Socket.IO Host] REJECTED unauthorized HOST_STATE_UPDATE from ${socketId} (sent hostTabId: ${msg.state.hostTabId}, expected: ${hostInfo.hostTabId})`);
                    return;
                }
                // Update socket ID on host reconnect
                hostInfo.socketId = socketId;
            }
            // Cache latest authoritative state in memory
            rooms.set(roomCode, msg.state);
        }
        else if ('roomCode' in msg && msg.roomCode) {
            roomCode = normalizeRoomCode(msg.roomCode);
        }
        if (!roomCode)
            return;
        // Track player mapping and cancel grace timers on player actions
        if (msg.type === 'PLAYER_JOIN_REQUEST' && msg.player?.id) {
            socketPlayerMap.set(socketId, { playerId: msg.player.id, roomCode });
            const timerKey = `${roomCode}:${msg.player.id}`;
            if (disconnectGraceTimers.has(timerKey)) {
                clearTimeout(disconnectGraceTimers.get(timerKey));
                disconnectGraceTimers.delete(timerKey);
            }
        }
        else if (msg.type === 'REQUEST_ROOM_SYNC' && msg.playerId) {
            socketPlayerMap.set(socketId, { playerId: msg.playerId, roomCode });
            const timerKey = `${roomCode}:${msg.playerId}`;
            if (disconnectGraceTimers.has(timerKey)) {
                clearTimeout(disconnectGraceTimers.get(timerKey));
                disconnectGraceTimers.delete(timerKey);
            }
        }
        else if (msg.type === 'PLAYER_LEAVE' && msg.playerId) {
            const timerKey = `${roomCode}:${msg.playerId}`;
            if (disconnectGraceTimers.has(timerKey)) {
                clearTimeout(disconnectGraceTimers.get(timerKey));
                disconnectGraceTimers.delete(timerKey);
            }
            const room = rooms.get(roomCode);
            if (room && room.players) {
                delete room.players[msg.playerId];
            }
        }
        // Ensure socket is joined to room
        if (!socket.rooms.has(roomCode)) {
            socket.join(roomCode);
            socketRoomMap.get(socketId)?.add(roomCode);
        }
        const roomSize = io.sockets.adapter.rooms.get(roomCode)?.size || 0;
        console.log(`[Socket.IO Server] Relaying sync_message '${msg.type}' to room '${roomCode}' (Sockets in room: ${roomSize})`);
        // Retransmit to all other clients in the same room
        socket.to(roomCode).emit('sync_message', msg);
        // If a player requests sync, provide cached state immediately
        if (msg.type === 'REQUEST_ROOM_SYNC') {
            const cached = rooms.get(roomCode);
            if (cached) {
                console.log(`[Socket.IO Server] Sending cached state for REQUEST_ROOM_SYNC in room ${roomCode} to socket ${socketId}`);
                socket.emit('sync_message', {
                    type: 'HOST_STATE_UPDATE',
                    state: cached,
                });
            }
        }
    });
    // Handle client disconnection with 60-second grace period
    socket.on('disconnect', (reason) => {
        console.log(`[Socket.IO] Client disconnected: ${socketId} (reason: ${reason})`);
        const playerInfo = socketPlayerMap.get(socketId);
        if (playerInfo) {
            const { playerId, roomCode } = playerInfo;
            const room = rooms.get(roomCode);
            if (room && room.players && room.players[playerId]) {
                console.log(`[Socket.IO] Player ${playerId} disconnected from room ${roomCode}. Starting 60s grace period.`);
                room.players[playerId].connected = false;
                // Notify room of player offline status
                io.to(roomCode).emit('sync_message', {
                    type: 'HOST_STATE_UPDATE',
                    state: room,
                });
                // Set 60-second grace period timer
                const timerKey = `${roomCode}:${playerId}`;
                if (disconnectGraceTimers.has(timerKey)) {
                    clearTimeout(disconnectGraceTimers.get(timerKey));
                }
                const timer = setTimeout(() => {
                    disconnectGraceTimers.delete(timerKey);
                    const currentRoom = rooms.get(roomCode);
                    if (currentRoom && currentRoom.players && currentRoom.players[playerId] && !currentRoom.players[playerId].connected) {
                        console.log(`[Socket.IO] Grace period expired for player ${playerId} in room ${roomCode}. Removing player from room.`);
                        delete currentRoom.players[playerId];
                        io.to(roomCode).emit('sync_message', {
                            type: 'HOST_STATE_UPDATE',
                            state: currentRoom,
                        });
                    }
                }, 60000);
                disconnectGraceTimers.set(timerKey, timer);
            }
            socketPlayerMap.delete(socketId);
        }
        socketRoomMap.delete(socketId);
    });
});
// Start listening
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n==================================================`);
    console.log(`🚀 QuizCraft Server is running on port ${PORT}`);
    console.log(`📡 WebSocket endpoint: http://localhost:${PORT}`);
    console.log(`⚡ REST API base:      http://localhost:${PORT}/api`);
    console.log(`🩺 Health check:       http://localhost:${PORT}/health`);
    console.log(`📚 Quizzes in memory:  ${quizzesMap.size}`);
    console.log(`==================================================\n`);
});
