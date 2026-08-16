export type Language = 'ru' | 'en' | 'uz';

export interface TranslationSchema {
  common: {
    save: string;
    saved: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    apply: string;
    close: string;
    reset: string;
    back: string;
    search: string;
    loading: string;
    online: string;
    offline: string;
    error: string;
    success: string;
    warning: string;
    host: string;
    player: string;
    pin: string;
    questionsCount: string;
    minutes: string;
    seconds: string;
    duplicate: string;
    import: string;
    export: string;
    soundOn: string;
    soundOff: string;
    aiSettings: string;
    theme: string;
    language: string;
    yes: string;
    no: string;
    enter: string;
    confirm: string;
    copied: string;
    version: string;
    general: string;
  };
  nav: {
    brand: string;
    subtitle: string;
    library: string;
    features: string;
    howItWorks: string;
    joinAsPlayer: string;
    createQuiz: string;
    enterPin: string;
  };
  home: {
    heroBadge: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    pinPlaceholder: string;
    enterArena: string;
    quickHost: string;
    statQuizzes: string;
    statQuestions: string;
    statMultiplayer: string;
    statFormats: string;
    recentTitle: string;
    recentDesc: string;
    viewAll: string;
    noQuizzesYet: string;
    createFirstQuiz: string;
    featuresTitle: string;
    featuresDesc: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
    f4Title: string;
    f4Desc: string;
    f5Title: string;
    f5Desc: string;
    f6Title: string;
    f6Desc: string;
    howTitle: string;
    howDesc: string;
    step1Num: string;
    step1Title: string;
    step1Desc: string;
    step2Num: string;
    step2Title: string;
    step2Desc: string;
    step3Num: string;
    step3Title: string;
    step3Desc: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaBtn: string;
    footerDesc: string;
    madeFor: string;
  };
  library: {
    title: string;
    backHome: string;
    searchPlaceholder: string;
    allCategories: string;
    createNew: string;
    importJson: string;
    exportJson: string;
    hostBtn: string;
    editBtn: string;
    duplicateBtn: string;
    deleteBtn: string;
    deleteConfirm: string;
    emptySearch: string;
    emptyLibrary: string;
    questionsCount: string;
    quickJoinPlaceholder: string;
    joinBtn: string;
    importSuccess: string;
    importError: string;
  };
  editor: {
    title: string;
    backToLib: string;
    saveSuccess: string;
    saveBtn: string;
    hostBtn: string;
    addQuestion: string;
    questionNum: string;
    aiPack: string;
    quizSettings: string;
    deleteQuestion: string;
    duplicateQuestion: string;
    moveUp: string;
    moveDown: string;
    unsavedChanges: string;
    noQuestions: string;
    timeLimit: string;
    pointsMultiplier: string;
    pointsStandard: string;
    pointsDouble: string;
    pointsNone: string;
    questionType: string;
    questionTitlePlaceholder: string;
    explanationLabel: string;
    explanationPlaceholder: string;
    singleChoice: string;
    multipleChoice: string;
    trueFalse: string;
    textInput: string;
    numberInput: string;
    orderSequence: string;
    pollSurvey: string;
    correctAnswerText: string;
    correctNumber: string;
    numberTolerance: string;
    optionPlaceholder: string;
    markCorrect: string;
    dragToReorder: string;
    slides: string;
    trueOption: string;
    falseOption: string;
  };
  quizMeta: {
    modalTitle: string;
    quizTitle: string;
    quizTitlePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    category: string;
    coverEmoji: string;
    saveMeta: string;
  };
  aiSettings: {
    modalTitle: string;
    byokBadge: string;
    subtitle: string;
    presets: string;
    baseUrl: string;
    modelName: string;
    apiKey: string;
    keyStorageNote: string;
    privacyNote: string;
    testConnection: string;
    testing: string;
    testSuccess: string;
    testError: string;
    reset: string;
    save: string;
    saved: string;
    showKey: string;
    hideKey: string;
  };
  aiTemplate: {
    modalTitleTemplates: string;
    modalTitleGenerate: string;
    subtitleTemplates: string;
    subtitleGenerate: string;
    tabTemplates: string;
    tabGenerate: string;
    searchPlaceholder: string;
    topicLabel: string;
    topicPlaceholder: string;
    configureKey: string;
    questionsCount: string;
    difficulty: string;
    difficultyEasy: string;
    difficultyMedium: string;
    difficultyHard: string;
    language: string;
    createBtn: string;
    creating: string;
    regenerate: string;
    insertQuestions: string;
    packContent: string;
    fallbackWarning: string;
    notFound: string;
    questionsSuffix: string;
  };
  aiChat: {
    botTitle: string;
    botStatus: string;
    floatingTooltip: string;
    welcomeMsg: string;
    sampleUserMsg: string;
    sampleAiMsg: string;
    inputPlaceholder: string;
    chipMoreQuestions: string;
    chipHarder: string;
    chipTrueFalse: string;
    generatedHeader: string;
    decline: string;
    apply: string;
    appliedSuccess: string;
    declinedStatus: string;
    appliedFollowup: string;
    declinedFollowup: string;
    fallbackNotice: string;
    genericHelp: string;
    errorMsg: string;
  };
  host: {
    roomCode: string;
    waitingPlayers: string;
    playersCount: string;
    startGame: string;
    addBot: string;
    removeBot: string;
    botSpeed: string;
    botAccuracy: string;
    copyLink: string;
    linkCopied: string;
    powerUpsEnabled: string;
    nextQuestion: string;
    showAnswers: string;
    leaderboard: string;
    podium: string;
    viewAnalytics: string;
    totalPoints: string;
    streak: string;
    answersReceived: string;
    exitGame: string;
    exitConfirm: string;
    returnHome: string;
    winner: string;
    accuracy: string;
    fastestPlayer: string;
    downloadResults: string;
    questionOf: string;
    timeRemaining: string;
    correctAnswersCount: string;
    optionDistribution: string;
    kickPlayer: string;
    scanQrToJoin: string;
  };
  player: {
    enterPin: string;
    enterNickname: string;
    nicknamePlaceholder: string;
    chooseAvatar: string;
    joinGame: string;
    connecting: string;
    youAreIn: string;
    seeNameOnScreen: string;
    waitHost: string;
    correct: string;
    wrong: string;
    protectedByShield: string;
    pointsEarned: string;
    streakBonus: string;
    currentRank: string;
    answerSubmitted: string;
    usePowerUp: string;
    powerUp5050: string;
    powerUp2x: string;
    powerUpShield: string;
    powerUpFreeze: string;
    finalRank: string;
    finalScore: string;
    playAgain: string;
    submitAnswer: string;
    typeYourAnswer: string;
    enterNumber: string;
    orderHint: string;
    pollThanks: string;
    frozenAlert: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  ru: {
    common: {
      save: 'Сохранить',
      saved: 'Сохранено!',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      create: 'Создать',
      apply: 'Применить',
      close: 'Закрыть',
      reset: 'Сброс',
      back: 'Назад',
      search: 'Поиск',
      loading: 'Загрузка...',
      online: 'Онлайн',
      offline: 'Офлайн',
      error: 'Ошибка',
      success: 'Успешно',
      warning: 'Внимание',
      host: 'Ведущий',
      player: 'Игрок',
      pin: 'PIN',
      questionsCount: '{count} вопр.',
      minutes: 'мин',
      seconds: 'сек',
      duplicate: 'Дублировать',
      import: 'Импорт',
      export: 'Экспорт',
      soundOn: 'Включить звук',
      soundOff: 'Выключить звук',
      aiSettings: 'Настройки ИИ',
      theme: 'Тема оформления',
      language: 'Язык интерфейса',
      yes: 'Да',
      no: 'Нет',
      enter: 'Войти',
      confirm: 'Подтвердить',
      copied: 'Скопировано!',
      version: 'v1.0',
      general: 'Общий',
    },
    nav: {
      brand: 'QuizCraft',
      subtitle: 'Интерактивный конструктор и Квиз-Арена',
      library: 'Библиотека ({count})',
      features: 'Возможности',
      howItWorks: 'Как это работает',
      joinAsPlayer: 'Войти как Игрок',
      createQuiz: 'Создать квиз',
      enterPin: 'PIN комнаты...',
    },
    home: {
      heroBadge: 'Платформа для живых викторин, тестов и опросов',
      heroTitle1: 'Создавайте викторины.',
      heroTitle2: 'Зажигайте арену.',
      heroDesc: 'Полноценный конструктор интерактивных квизов и многопользовательская комната в реальном времени. 7 форматов вопросов, карточки усилений, боевой режим со стриками и подробная аналитика.',
      pinPlaceholder: 'Введите 6-значный PIN комнаты...',
      enterArena: 'Войти в игру',
      quickHost: 'Быстрый запуск демо',
      statQuizzes: 'Квизов в библиотеке',
      statQuestions: 'Готовых вопросов',
      statMultiplayer: 'Синхронизация в реальном времени',
      statFormats: 'Уникальных форматов вопросов',
      recentTitle: 'Недавние викторины',
      recentDesc: 'Запустите готовую игру в один клик или продолжите редактирование',
      viewAll: 'Вся библиотека',
      noQuizzesYet: 'Пока нет созданных викторин',
      createFirstQuiz: 'Создайте свой первый квиз прямо сейчас!',
      featuresTitle: 'Возможности QuizCraft',
      featuresDesc: 'Все необходимое для проведения увлекательных интерактивных викторин в одном месте',
      f1Title: '7 форматов вопросов',
      f1Desc: 'Одиночный выбор, множественный, правда/ложь, открытый текст, числовой с погрешностью, сортировка и опросы без очков.',
      f2Title: 'Live-синхронизация',
      f2Desc: 'Мгновенное подключение игроков через WebSocket, таймер и анимации на всех устройствах синхронно.',
      f3Title: 'Боевой режим и Усиления',
      f3Desc: 'Карточки 50/50, удвоение очков, щиты от ошибок и заморозка таймера делают соревнование динамичным.',
      f4Title: 'Генератор ИИ вопросов',
      f4Desc: 'Интеграция с Gemini, OpenAI, Groq, DeepSeek и локальными моделями для мгновенного создания квизов по любой теме.',
      f5Title: 'Симулятор AI-ботов',
      f5Desc: 'Тестируйте квизы без реальных игроков — подключайте ботов с настраиваемой точностью и скоростью реакции.',
      f6Title: 'Подробная аналитика',
      f6Desc: 'Распределение ответов, сложные вопросы, статистика точности и экспорт итоговых результатов игры.',
      howTitle: 'Как это работает',
      howDesc: 'Всего три простых шага от идеи до запуска захватывающей викторины',
      step1Num: '01',
      step1Title: 'Создайте или сгенерируйте квиз',
      step1Desc: 'Используйте готовые шаблоны, конструктор или ИИ-генератор вопросов по любой теме.',
      step2Num: '02',
      step2Title: 'Поделитесь PIN-кодом с игроками',
      step2Desc: 'Игроки подключаются с любого смартфона или ноутбука без регистрации.',
      step3Num: '03',
      step3Title: 'Зажигайте на Арене!',
      step3Desc: 'Управляйте ходом игры, следите за таблицей лидеров и награждайте победителей на подиуме.',
      ctaTitle: 'Готовы провести незабываемый квиз?',
      ctaDesc: 'Создайте викторину прямо сейчас или запустите готовый шаблон за 10 секунд!',
      ctaBtn: 'Начать прямо сейчас',
      footerDesc: 'Интерактивная платформа для викторин и онлайн-соревнований.',
      madeFor: 'Создано для живого вовлечения аудитории',
    },
    library: {
      title: 'Библиотека викторин',
      backHome: '← На главную',
      searchPlaceholder: 'Поиск по названию или описанию...',
      allCategories: 'Все',
      createNew: 'Создать квиз',
      importJson: 'Импорт JSON',
      exportJson: 'Экспорт',
      hostBtn: 'Запустить игру',
      editBtn: 'Редактор',
      duplicateBtn: 'Дублировать',
      deleteBtn: 'Удалить',
      deleteConfirm: 'Вы уверены, что хотите удалить этот квиз?',
      emptySearch: 'По вашему запросу ничего не найдено',
      emptyLibrary: 'Библиотека пуста. Создайте свой первый квиз!',
      questionsCount: '{count} вопросов',
      quickJoinPlaceholder: 'PIN комнаты...',
      joinBtn: 'Войти',
      importSuccess: 'Квиз успешно импортирован!',
      importError: 'Ошибка при чтении JSON файла',
    },
    editor: {
      title: 'Редактор квиза',
      backToLib: 'В библиотеку',
      saveSuccess: 'Сохранено!',
      saveBtn: 'Сохранить',
      hostBtn: 'Запустить игру',
      addQuestion: 'Добавить вопрос',
      questionNum: 'Вопрос {num}',
      aiPack: 'ИИ-генератор',
      quizSettings: 'Настройки квиза',
      deleteQuestion: 'Удалить вопрос',
      duplicateQuestion: 'Дублировать вопрос',
      moveUp: 'Вверх',
      moveDown: 'Вниз',
      unsavedChanges: 'Есть несохраненные изменения',
      noQuestions: 'В этом квизе пока нет вопросов. Нажмите «Добавить вопрос» или используйте «ИИ-генератор».',
      timeLimit: 'Время на ответ',
      pointsMultiplier: 'Очки за вопрос',
      pointsStandard: 'Стандартные (1000)',
      pointsDouble: 'Двойные (2000)',
      pointsNone: 'Без очков (опрос)',
      questionType: 'Тип вопроса',
      questionTitlePlaceholder: 'Введите текст вопроса...',
      explanationLabel: 'Объяснение правильного ответа (необязательно)',
      explanationPlaceholder: 'Интересный факт или подробности о правильном ответе...',
      singleChoice: 'Один вариант',
      multipleChoice: 'Несколько вариантов',
      trueFalse: 'Правда / Ложь',
      textInput: 'Текстовый ввод',
      numberInput: 'Числовой ответ',
      orderSequence: 'Порядок / Хронология',
      pollSurvey: 'Опрос / Голосование',
      correctAnswerText: 'Точный правильный ответ',
      correctNumber: 'Правильное число',
      numberTolerance: 'Погрешность (±)',
      optionPlaceholder: 'Вариант ответа {num}',
      markCorrect: 'Правильный ответ',
      dragToReorder: 'Перетащите для изменения порядка',
      slides: 'Слайды',
      trueOption: 'Правда (True)',
      falseOption: 'Ложь (False)',
    },
    quizMeta: {
      modalTitle: 'Параметры квиза',
      quizTitle: 'Название квиза',
      quizTitlePlaceholder: 'Например: Мировое кино и культовые сериалы',
      description: 'Описание',
      descriptionPlaceholder: 'Краткое описание темы и формата викторины...',
      category: 'Категория',
      coverEmoji: 'Эмодзи обложки',
      saveMeta: 'Применить настройки',
    },
    aiSettings: {
      modalTitle: 'Настройки ИИ-провайдера',
      byokBadge: 'BYOK',
      subtitle: 'Собственный API-ключ Gemini, OpenAI или любого совместимого шлюза',
      presets: 'Быстрые пресеты:',
      baseUrl: 'Base URL провайдера',
      modelName: 'Название модели',
      apiKey: 'API Key / Токен',
      keyStorageNote: 'Хранится только в браузере',
      privacyNote: 'Ключ отправляется только на локальный backend-сервер в момент генерации и не сохраняется в постоянных базах данных. Настройки изолированы для каждого участника (localStorage).',
      testConnection: 'Проверить соединение',
      testing: 'Проверка...',
      testSuccess: 'Соединение с ИИ успешно установлено!',
      testError: 'Ошибка проверки соединения',
      reset: 'Сброс',
      save: 'Сохранить',
      saved: 'Сохранено!',
      showKey: 'Показать ключ',
      hideKey: 'Скрыть ключ',
    },
    aiTemplate: {
      modalTitleTemplates: 'Готовые наборы вопросов',
      modalTitleGenerate: 'Генератор вопросов через ИИ',
      subtitleTemplates: 'Сбалансированные пакеты вопросов разных типов для быстрого старта',
      subtitleGenerate: 'Мгновенная генерация вопросов по любой теме с помощью Gemini/OpenAI',
      tabTemplates: 'Курированные наборы',
      tabGenerate: 'Генерация ИИ',
      searchPlaceholder: 'Поиск по теме или названию набора...',
      topicLabel: 'Тема квиза или ключевые понятия:',
      topicPlaceholder: 'Например: Архитектура микросервисов, Гарри Поттер, Квантовая физика...',
      configureKey: 'Настроить модель / ключ',
      questionsCount: 'Кол-во вопросов',
      difficulty: 'Сложность',
      difficultyEasy: 'Простая',
      difficultyMedium: 'Средняя',
      difficultyHard: 'Высокая',
      language: 'Язык',
      createBtn: 'Создать',
      creating: 'Создание...',
      regenerate: 'Перегенерировать',
      insertQuestions: 'Вставить {count} вопросов',
      packContent: 'Содержимое набора «{title}»:',
      fallbackWarning: '⚠️ Не удалось сгенерировать через ИИ ({reason}), использован демо-шаблон.',
      notFound: 'Наборов по вашему запросу не найдено',
      questionsSuffix: 'вопр.',
    },
    aiChat: {
      botTitle: 'ИИ-Помощник QuizArena',
      botStatus: 'Онлайн • Генерация вопросов',
      floatingTooltip: 'ИИ Бот Ассистент',
      welcomeMsg: 'Привет! 👋 Я ИИ-ассистент QuizArena. Чем помочь в создании квиза?',
      sampleUserMsg: 'Помоги создать 3 квиза основываясь на вопросах и тайтле квиза',
      sampleAiMsg: 'Конечно! Вот вам 3 сгенерированных вопроса по теме "{topic}":',
      inputPlaceholder: 'Задайте вопрос ИИ боту...',
      chipMoreQuestions: 'Еще 3 вопроса',
      chipHarder: '🎯 Сложные вопросы',
      chipTrueFalse: '⚡ True / False',
      generatedHeader: 'Сгенерировано 3 вопроса',
      decline: 'Отклонить',
      apply: 'Вставить в квиз',
      appliedSuccess: 'Вопросы вставлены в квиз ✓',
      declinedStatus: 'Генерация отклонена',
      appliedFollowup: '🎉 Отлично! 3 вопроса успешно добавлены в ваш квиз. Вы можете отредактировать их в любое время.',
      declinedFollowup: 'Понял, эти вопросы отменены. Напишите мне, если нужны другие варианты!',
      fallbackNotice: '⚠️ Не удалось сгенерировать через ИИ ({reason}), подставлен демо-шаблон по теме "{topic}":',
      genericHelp: 'Я готов помочь с квизом! Напишите "Сгенерируй 3 вопроса по Python" или нажмите быструю кнопку ниже.',
      errorMsg: 'Не удалось сгенерировать вопросы через ИИ. Попробуйте еще раз или проверьте настройки API.',
    },
    host: {
      roomCode: 'Код комнаты',
      waitingPlayers: 'Ожидание игроков...',
      playersCount: 'Игроков в комнате: {count}',
      startGame: 'Начать игру',
      addBot: '+ Бот',
      removeBot: '- Бот',
      botSpeed: 'Скорость ботов',
      botAccuracy: 'Точность ботов',
      copyLink: 'Скопировать ссылку',
      linkCopied: 'Ссылка скопирована!',
      powerUpsEnabled: 'Усиления включены',
      nextQuestion: 'Следующий вопрос',
      showAnswers: 'Показать ответы',
      leaderboard: 'Таблица лидеров',
      podium: 'Подиум победителей',
      viewAnalytics: 'Аналитика игры',
      totalPoints: '{points} очков',
      streak: 'Стрик: {count} 🔥',
      answersReceived: 'Ответили: {count} из {total}',
      exitGame: 'Завершить игру',
      exitConfirm: 'Вы действительно хотите завершить игру?',
      returnHome: 'На главную',
      winner: 'Победитель!',
      accuracy: 'Средняя точность',
      fastestPlayer: 'Самый быстрый ответ',
      downloadResults: 'Скачать результаты (JSON)',
      questionOf: 'Вопрос {current} из {total}',
      timeRemaining: 'Осталось времени',
      correctAnswersCount: '{count} правильных ответов',
      optionDistribution: 'Распределение ответов игроков',
      kickPlayer: 'Исключить игрока',
      scanQrToJoin: 'Сканируйте QR или перейдите на страницу игрока',
    },
    player: {
      enterPin: 'PIN код игры',
      enterNickname: 'Ваш никнейм',
      nicknamePlaceholder: 'Например: RocketPlayer',
      chooseAvatar: 'Выберите аватар',
      joinGame: 'Войти в игру',
      connecting: 'Подключение...',
      youAreIn: 'Вы в игре!',
      seeNameOnScreen: 'Видите свое имя на главном экране?',
      waitHost: 'Ожидание запуска ведущим...',
      correct: 'Правильно!',
      wrong: 'Неправильно!',
      protectedByShield: 'Спасен щитом!',
      pointsEarned: '+{points} очков',
      streakBonus: 'Бонус за стрик: +{points}',
      currentRank: 'Место: #{rank}',
      answerSubmitted: 'Ответ принят! Ждем остальных игроков...',
      usePowerUp: 'Использовать усиление',
      powerUp5050: '50:50 (убрать 2 неверных)',
      powerUp2x: '2x Очки за этот вопрос',
      powerUpShield: 'Щит от одной ошибки',
      powerUpFreeze: 'Заморозить таймер',
      finalRank: 'Ваше итоговое место: #{rank}',
      finalScore: 'Итоговые очки: {score}',
      playAgain: 'Сыграть еще раз',
      submitAnswer: 'Отправить ответ',
      typeYourAnswer: 'Введите ваш ответ...',
      enterNumber: 'Введите число...',
      orderHint: 'Перетащите элементы в правильном порядке',
      pollThanks: 'Спасибо за ваш голос!',
      frozenAlert: 'Таймер заморожен!',
    },
  },
  en: {
    common: {
      save: 'Save',
      saved: 'Saved!',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      apply: 'Apply',
      close: 'Close',
      reset: 'Reset',
      back: 'Back',
      search: 'Search',
      loading: 'Loading...',
      online: 'Online',
      offline: 'Offline',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      host: 'Host',
      player: 'Player',
      pin: 'PIN',
      questionsCount: '{count} Qs',
      minutes: 'min',
      seconds: 'sec',
      duplicate: 'Duplicate',
      import: 'Import',
      export: 'Export',
      soundOn: 'Unmute audio',
      soundOff: 'Mute audio',
      aiSettings: 'AI Settings',
      theme: 'Color Theme',
      language: 'Language',
      yes: 'Yes',
      no: 'No',
      enter: 'Enter',
      confirm: 'Confirm',
      copied: 'Copied!',
      version: 'v1.0',
      general: 'General',
    },
    nav: {
      brand: 'QuizCraft',
      subtitle: 'Interactive Quiz Builder & Live Arena',
      library: 'Library ({count})',
      features: 'Features',
      howItWorks: 'How it works',
      joinAsPlayer: 'Join as Player',
      createQuiz: 'Create Quiz',
      enterPin: 'Room PIN...',
    },
    home: {
      heroBadge: 'Platform for live interactive quizzes, trivia & polls',
      heroTitle1: 'Create Live Quizzes.',
      heroTitle2: 'Ignite the Arena.',
      heroDesc: 'Comprehensive interactive quiz builder and real-time multiplayer arena. 7 question formats, power-up cards, battle streaks, and deep post-game analytics.',
      pinPlaceholder: 'Enter 6-digit room PIN...',
      enterArena: 'Join Game',
      quickHost: 'Quick Demo Host',
      statQuizzes: 'Quizzes in Library',
      statQuestions: 'Ready Questions',
      statMultiplayer: 'Real-time Sync Engine',
      statFormats: 'Unique Question Formats',
      recentTitle: 'Recent Quizzes',
      recentDesc: 'Host a game in one click or continue customizing questions',
      viewAll: 'Full Library',
      noQuizzesYet: 'No quizzes created yet',
      createFirstQuiz: 'Build your first quiz right now!',
      featuresTitle: 'QuizCraft Features',
      featuresDesc: 'Everything you need to run engaging interactive quizzes in one place',
      f1Title: '7 Question Formats',
      f1Desc: 'Single choice, multiple choice, true/false, open text, numeric with tolerance, sequence ordering, and polls.',
      f2Title: 'Live Synchronization',
      f2Desc: 'Instant player connection via WebSocket, synchronized timers and rich animations across all devices.',
      f3Title: 'Battle Mode & Power-Ups',
      f3Desc: '50/50 cards, double points, error shields, and timer freeze cards make the competition thrilling.',
      f4Title: 'AI Question Generator',
      f4Desc: 'Seamless integration with Gemini, OpenAI, Groq, DeepSeek, and local models to generate questions on any topic.',
      f5Title: 'AI Bot Simulator',
      f5Desc: 'Test quizzes without real players by spawning virtual bot participants with customizable speed and accuracy.',
      f6Title: 'Deep Game Analytics',
      f6Desc: 'Answer distribution breakdown, hardest questions, accuracy rates, and instant JSON export.',
      howTitle: 'How It Works',
      howDesc: 'Just three simple steps from concept to hosting an unforgettable live quiz',
      step1Num: '01',
      step1Title: 'Create or AI-generate a quiz',
      step1Desc: 'Use curated template packs, custom editor, or AI generation on any topic.',
      step2Num: '02',
      step2Title: 'Share the PIN with players',
      step2Desc: 'Participants join from any phone, tablet, or laptop without registration.',
      step3Num: '03',
      step3Title: 'Ignite the Live Arena!',
      step3Desc: 'Control game flow, watch live leaderboard battle, and celebrate podium winners.',
      ctaTitle: 'Ready to host an unforgettable quiz?',
      ctaDesc: 'Create your quiz now or launch a ready-made template in 10 seconds!',
      ctaBtn: 'Get Started Now',
      footerDesc: 'Interactive live quiz platform for learning and entertainment.',
      madeFor: 'Built for high audience engagement',
    },
    library: {
      title: 'Quiz Library',
      backHome: '← Back to Home',
      searchPlaceholder: 'Search by title or description...',
      allCategories: 'All',
      createNew: 'Create Quiz',
      importJson: 'Import JSON',
      exportJson: 'Export',
      hostBtn: 'Host Game',
      editBtn: 'Edit',
      duplicateBtn: 'Duplicate',
      deleteBtn: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this quiz?',
      emptySearch: 'No quizzes found matching your search',
      emptyLibrary: 'Library is empty. Create your first quiz!',
      questionsCount: '{count} questions',
      quickJoinPlaceholder: 'Room PIN...',
      joinBtn: 'Join',
      importSuccess: 'Quiz imported successfully!',
      importError: 'Failed to parse JSON file',
    },
    editor: {
      title: 'Quiz Editor',
      backToLib: 'To Library',
      saveSuccess: 'Saved!',
      saveBtn: 'Save Quiz',
      hostBtn: 'Host Game',
      addQuestion: 'Add Question',
      questionNum: 'Question {num}',
      aiPack: 'AI Generator',
      quizSettings: 'Quiz Settings',
      deleteQuestion: 'Delete Question',
      duplicateQuestion: 'Duplicate Question',
      moveUp: 'Move Up',
      moveDown: 'Move Down',
      unsavedChanges: 'Unsaved changes',
      noQuestions: 'No questions in this quiz yet. Click "Add Question" or use "AI Generator".',
      timeLimit: 'Time Limit',
      pointsMultiplier: 'Points Multiplier',
      pointsStandard: 'Standard (1000)',
      pointsDouble: 'Double (2000)',
      pointsNone: 'No points (poll)',
      questionType: 'Question Type',
      questionTitlePlaceholder: 'Enter question text...',
      explanationLabel: 'Correct answer explanation (optional)',
      explanationPlaceholder: 'Interesting fact or explanation details...',
      singleChoice: 'Single Choice',
      multipleChoice: 'Multiple Choice',
      trueFalse: 'True / False',
      textInput: 'Text Input',
      numberInput: 'Number Input',
      orderSequence: 'Chronological Order',
      pollSurvey: 'Poll / Survey',
      correctAnswerText: 'Exact correct answer',
      correctNumber: 'Correct number',
      numberTolerance: 'Tolerance (±)',
      optionPlaceholder: 'Option {num}',
      markCorrect: 'Correct answer',
      dragToReorder: 'Drag to reorder options',
      slides: 'Slides',
      trueOption: 'True',
      falseOption: 'False',
    },
    quizMeta: {
      modalTitle: 'Quiz Settings',
      quizTitle: 'Quiz Title',
      quizTitlePlaceholder: 'E.g.: World Cinema & Iconic TV Series',
      description: 'Description',
      descriptionPlaceholder: 'Brief description of the quiz theme and format...',
      category: 'Category',
      coverEmoji: 'Cover Emoji',
      saveMeta: 'Apply Settings',
    },
    aiSettings: {
      modalTitle: 'AI Provider Settings',
      byokBadge: 'BYOK',
      subtitle: 'Custom API Key for Gemini, OpenAI or any compatible gateway',
      presets: 'Quick Presets:',
      baseUrl: 'Provider Base URL',
      modelName: 'Model Name',
      apiKey: 'API Key / Token',
      keyStorageNote: 'Stored in browser only',
      privacyNote: 'API Key is only sent to your local backend during quiz generation and never saved in persistent databases. Isolated per browser (localStorage).',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      testSuccess: 'AI connection verified successfully!',
      testError: 'Connection test failed',
      reset: 'Reset',
      save: 'Save',
      saved: 'Saved!',
      showKey: 'Show key',
      hideKey: 'Hide key',
    },
    aiTemplate: {
      modalTitleTemplates: 'Curated Question Packs',
      modalTitleGenerate: 'AI Question Generator',
      subtitleTemplates: 'Balanced multi-format question packs for a fast start',
      subtitleGenerate: 'Instant questions generation on any topic with Gemini/OpenAI',
      tabTemplates: 'Curated Packs',
      tabGenerate: 'AI Generator',
      searchPlaceholder: 'Search by topic or pack title...',
      topicLabel: 'Quiz topic or key concepts:',
      topicPlaceholder: 'E.g.: Microservices Architecture, Harry Potter, Quantum Physics...',
      configureKey: 'Configure Model / Key',
      questionsCount: 'Question Count',
      difficulty: 'Difficulty',
      difficultyEasy: 'Easy',
      difficultyMedium: 'Medium',
      difficultyHard: 'Hard',
      language: 'Language',
      createBtn: 'Generate',
      creating: 'Generating...',
      regenerate: 'Regenerate',
      insertQuestions: 'Insert {count} Questions',
      packContent: 'Contents of pack "{title}":',
      fallbackWarning: '⚠️ Remote AI generation failed ({reason}), demo template pack was loaded instead.',
      notFound: 'No packs found matching your query',
      questionsSuffix: 'Qs',
    },
    aiChat: {
      botTitle: 'QuizArena AI Assistant',
      botStatus: 'Online • Question Generation',
      floatingTooltip: 'AI Bot Assistant',
      welcomeMsg: 'Hello! 👋 I am the QuizArena AI assistant. How can I help you build your quiz?',
      sampleUserMsg: 'Help me create 3 quiz questions based on the topic and title',
      sampleAiMsg: 'Sure! Here are 3 generated questions on "{topic}":',
      inputPlaceholder: 'Ask the AI bot...',
      chipMoreQuestions: '3 more questions',
      chipHarder: '🎯 Harder questions',
      chipTrueFalse: '⚡ True / False',
      generatedHeader: 'Generated 3 Questions',
      decline: 'Decline',
      apply: 'Insert into Quiz',
      appliedSuccess: 'Questions inserted into quiz ✓',
      declinedStatus: 'Generation declined',
      appliedFollowup: '🎉 Awesome! 3 questions were added to your quiz. You can edit them at any time.',
      declinedFollowup: 'Got it, these questions were dismissed. Let me know if you want different ones!',
      fallbackNotice: '⚠️ Remote AI generation failed ({reason}), loaded demo questions for "{topic}":',
      genericHelp: 'I am ready to help! Type "Generate 3 Python questions" or click a quick suggestion below.',
      errorMsg: 'Failed to generate questions via AI. Please check your API settings and try again.',
    },
    host: {
      roomCode: 'Room Code',
      waitingPlayers: 'Waiting for players...',
      playersCount: 'Players in room: {count}',
      startGame: 'Start Game',
      addBot: '+ Bot',
      removeBot: '- Bot',
      botSpeed: 'Bot Speed',
      botAccuracy: 'Bot Accuracy',
      copyLink: 'Copy Room Link',
      linkCopied: 'Link copied to clipboard!',
      powerUpsEnabled: 'Power-Ups Enabled',
      nextQuestion: 'Next Question',
      showAnswers: 'Reveal Answers',
      leaderboard: 'Leaderboard',
      podium: 'Winners Podium',
      viewAnalytics: 'Game Analytics',
      totalPoints: '{points} pts',
      streak: 'Streak: {count} 🔥',
      answersReceived: 'Answered: {count} of {total}',
      exitGame: 'End Game',
      exitConfirm: 'Are you sure you want to end the game?',
      returnHome: 'Return to Home',
      winner: 'Winner!',
      accuracy: 'Average Accuracy',
      fastestPlayer: 'Fastest Answer',
      downloadResults: 'Download Results (JSON)',
      questionOf: 'Question {current} of {total}',
      timeRemaining: 'Time Left',
      correctAnswersCount: '{count} correct answers',
      optionDistribution: 'Player Answer Distribution',
      kickPlayer: 'Kick Player',
      scanQrToJoin: 'Scan QR code or open player join page',
    },
    player: {
      enterPin: 'Game PIN Code',
      enterNickname: 'Your Nickname',
      nicknamePlaceholder: 'E.g.: RocketPlayer',
      chooseAvatar: 'Choose Avatar',
      joinGame: 'Join Game',
      connecting: 'Connecting...',
      youAreIn: 'You are in!',
      seeNameOnScreen: 'Do you see your name on the main screen?',
      waitHost: 'Waiting for host to start...',
      correct: 'Correct!',
      wrong: 'Wrong!',
      protectedByShield: 'Protected by Shield!',
      pointsEarned: '+{points} pts',
      streakBonus: 'Streak bonus: +{points}',
      currentRank: 'Rank: #{rank}',
      answerSubmitted: 'Answer submitted! Waiting for others...',
      usePowerUp: 'Use Power-Up',
      powerUp5050: '50:50 (remove 2 wrong)',
      powerUp2x: '2x Points for this question',
      powerUpShield: 'Shield against 1 wrong answer',
      powerUpFreeze: 'Freeze question timer',
      finalRank: 'Your Final Rank: #{rank}',
      finalScore: 'Final Score: {score}',
      playAgain: 'Play Again',
      submitAnswer: 'Submit Answer',
      typeYourAnswer: 'Type your answer...',
      enterNumber: 'Enter number...',
      orderHint: 'Drag and drop items in correct order',
      pollThanks: 'Thanks for voting!',
      frozenAlert: 'Timer Frozen!',
    },
  },
  uz: {
    common: {
      save: 'Saqlash',
      saved: 'Saqlandi!',
      cancel: 'Bekor qilish',
      delete: 'O\'chirish',
      edit: 'Tahrirlash',
      create: 'Yaratish',
      apply: 'Qo\'llash',
      close: 'Yopish',
      reset: 'Qaytarish',
      back: 'Orqaga',
      search: 'Qidiruv',
      loading: 'Yuklanmoqda...',
      online: 'Onlayn',
      offline: 'Oflayn',
      error: 'Xatolik',
      success: 'Muvaffaqiyatli',
      warning: 'Diqqat',
      host: 'Boshlovchi',
      player: 'O\'yinchi',
      pin: 'PIN',
      questionsCount: '{count} savol',
      minutes: 'daq',
      seconds: 'son',
      duplicate: 'Nusxalash',
      import: 'Import',
      export: 'Eksport',
      soundOn: 'Ovozni yoqish',
      soundOff: 'Ovozni o\'chirish',
      aiSettings: 'AI Sozlamalari',
      theme: 'Mavzu rangi',
      language: 'Tilni tanlash',
      yes: 'Ha',
      no: 'Yo\'q',
      enter: 'Kirish',
      confirm: 'Tasdiqlash',
      copied: 'Nusxalandi!',
      version: 'v1.0',
      general: 'Umumiy',
    },
    nav: {
      brand: 'QuizCraft',
      subtitle: 'Interaktiv Viktorina Konstruktori va Jonli Arena',
      library: 'Kutubxona ({count})',
      features: 'Imkoniyatlar',
      howItWorks: 'Qanday ishlaydi',
      joinAsPlayer: 'O\'yinchi sifatida kirish',
      createQuiz: 'Viktorina yaratish',
      enterPin: 'Xona PIN kodi...',
    },
    home: {
      heroBadge: 'Jonli interaktiv viktorinalar va testlar platformasi',
      heroTitle1: 'Viktorinalar yarating.',
      heroTitle2: 'Arenada g\'alaba qozoning.',
      heroDesc: 'Interaktiv viktorinalar konstruktori va real vaqtda multiplayer o\'yin xonasi. 7 xil savol formati, kuchaytirgich kartalari, seriya bonuslari va to\'liq o\'yin tahlili.',
      pinPlaceholder: '6 xonali xona PIN kodini kiriting...',
      enterArena: 'O\'yinga kirish',
      quickHost: 'Tezkor demo boshlash',
      statQuizzes: 'Kutubxonadagi viktorinalar',
      statQuestions: 'Tayyor savollar',
      statMultiplayer: 'Real vaqtda sinxronizatsiya',
      statFormats: 'Noyob savol formatlari',
      recentTitle: 'So\'nggi viktorinalar',
      recentDesc: 'O\'yinni bir bosishda boshlang yoki savollarni tahrirlashda davom eting',
      viewAll: 'Barcha viktorinalar',
      noQuizzesYet: 'Hali yaratilgan viktorinalar yo\'q',
      createFirstQuiz: 'Birinchi viktorinangizni hoziroq yarating!',
      featuresTitle: 'QuizCraft Imkoniyatlari',
      featuresDesc: 'Qiziqarli interaktiv viktorinalar o\'tkazish uchun kerak bo\'lgan barcha qulayliklar',
      f1Title: '7 xil savol formati',
      f1Desc: 'Bitta to\'g\'ri javob, bir nechta to\'g\'ri javob, to\'g\'ri/noto\'g\'ri, matnli javob, sonli oraliq, ketma-ketlik va so\'rovnomalar.',
      f2Title: 'Jonli Sinxronizatsiya',
      f2Desc: 'WebSocket orqali barcha qurilmalarda tezkor ulanish, taymer va jonli animatsiyalar sinxron ishlaydi.',
      f3Title: 'Jang Rejimi va Kuchaytirgichlar',
      f3Desc: '50/50 kartalari, ikki barobar ball, xatodan himoya qalqoni va taymerni muzlatish o\'yinni juda qiziqarli qiladi.',
      f4Title: 'Sun\'iy Intellekt Savollar Generatori',
      f4Desc: 'Gemini, OpenAI, Groq, DeepSeek bilan integratsiya orqali istalgan mavzuda bir zumda viktorina yaratish.',
      f5Title: 'AI Botlar Simulyatori',
      f5Desc: 'O\'yinchilarsiz ham viktorinani sinab ko\'rish — tezligi va aniqligi sozlanadigan virtual botlarni qo\'shing.',
      f6Title: 'Batafsil O\'yin Tahlili',
      f6Desc: 'Javoblar taqsimoti, eng qiyin savollar, aniqlik statistikasi va natijalarni JSON formatida yuklab olish.',
      howTitle: 'Qanday ishlaydi',
      howDesc: 'G\'oyadan ajoyib viktorina o\'tkazishgacha bo\'lgan uchta oddiy qadam',
      step1Num: '01',
      step1Title: 'Viktorina yarating yoki AI bilan generatsiya qiling',
      step1Desc: 'Tayyor to\'plamlardan, qulay konstruktordan yoki sun\'iy intellektdan foydalaning.',
      step2Num: '02',
      step2Title: 'PIN kodni o\'yinchilarga ulashing',
      step2Desc: 'Ishtirokchilar istalgan telefon, planshet yoki noutbukdan ro\'yxatdan o\'tmasdan ulanadilar.',
      step3Num: '03',
      step3Title: 'Jonli Arenada boshlang!',
      step3Desc: 'O\'yinni boshqaring, yetakchilar jadvalini kuzating va g\'oliblarni shohsupada taqdirlang.',
      ctaTitle: 'Unutilmas viktorina o\'tkazishga tayyormisiz?',
      ctaDesc: 'Hoziroq o\'z viktorinangizni yarating yoki tayyor shablonni 10 soniyada ishga tushiring!',
      ctaBtn: 'Hoziroq boshlash',
      footerDesc: 'Ta\'lim va ko\'ngilochar tadbirlar uchun jonli interaktiv viktorina platformasi.',
      madeFor: 'Auditoriyani faol jalb qilish uchun yaratilgan',
    },
    library: {
      title: 'Viktorinalar Kutubxonasi',
      backHome: '← Asosiy sahifaga',
      searchPlaceholder: 'Nomi yoki tavsifi bo\'yicha qidiruv...',
      allCategories: 'Barchasi',
      createNew: 'Viktorina yaratish',
      importJson: 'JSON Import',
      exportJson: 'Eksport',
      hostBtn: 'O\'yinni boshlash',
      editBtn: 'Tahrirlash',
      duplicateBtn: 'Nusxalash',
      deleteBtn: 'O\'chirish',
      deleteConfirm: 'Ushbu viktorinani o\'chirishni xohlaysizmi?',
      emptySearch: 'Qidiruvingiz bo\'yicha hech narsa topilmadi',
      emptyLibrary: 'Kutubxona bo\'sh. Birinchi viktorinangizni yarating!',
      questionsCount: '{count} savol',
      quickJoinPlaceholder: 'Xona PIN kodi...',
      joinBtn: 'Kirish',
      importSuccess: 'Viktorina muvaffaqiyatli import qilindi!',
      importError: 'JSON faylini o\'qishda xatolik yuz berdi',
    },
    editor: {
      title: 'Viktorina Tahrirlovchisi',
      backToLib: 'Kutubxonaga',
      saveSuccess: 'Saqlandi!',
      saveBtn: 'Saqlash',
      hostBtn: 'O\'yinni boshlash',
      addQuestion: 'Savol qo\'shish',
      questionNum: '{num}-savol',
      aiPack: 'AI Generator',
      quizSettings: 'Viktorina sozlamalari',
      deleteQuestion: 'Savolni o\'chirish',
      duplicateQuestion: 'Savolni nusxalash',
      moveUp: 'Yuqoriga',
      moveDown: 'Pastga',
      unsavedChanges: 'Saqlanmagan o\'zgarishlar mavjud',
      noQuestions: 'Ushbu viktorinada hali savollar yo\'q. "Savol qo\'shish" yoki "AI Generator" tugmasini bosing.',
      timeLimit: 'Javob berish vaqti',
      pointsMultiplier: 'Savol balli',
      pointsStandard: 'Standart (1000)',
      pointsDouble: 'Ikki barobar (2000)',
      pointsNone: 'Ballsiz (so\'rovnoma)',
      questionType: 'Savol turi',
      questionTitlePlaceholder: 'Savol matnini kiriting...',
      explanationLabel: 'To\'g\'ri javob izohi (ixtiyoriy)',
      explanationPlaceholder: 'Qiziqarli fakt yoki to\'g\'ri javob haqida batafsil ma\'lumot...',
      singleChoice: 'Bitta tanlov',
      multipleChoice: 'Bir nechta tanlov',
      trueFalse: 'To\'g\'ri / Noto\'g\'ri',
      textInput: 'Matnli javob',
      numberInput: 'Sonli javob',
      orderSequence: 'Ketma-ketlik / Xronologiya',
      pollSurvey: 'So\'rovnoma / Ovoz berish',
      correctAnswerText: 'Aniq to\'g\'ri javob matni',
      correctNumber: 'To\'g\'ri son',
      numberTolerance: 'Ruxsat etilgan xatolik (±)',
      optionPlaceholder: '{num}-variant',
      markCorrect: 'To\'g\'ri javob',
      dragToReorder: 'Tartibni o\'zgartirish uchun suring',
      slides: 'Slaydlar',
      trueOption: 'To\'g\'ri (True)',
      falseOption: 'Noto\'g\'ri (False)',
    },
    quizMeta: {
      modalTitle: 'Viktorina Parametrlari',
      quizTitle: 'Viktorina nomi',
      quizTitlePlaceholder: 'Masalan: Jahon kinosi va mashhur seriallar',
      description: 'Tavsif',
      descriptionPlaceholder: 'Viktorina mavzusi va formati haqida qisqacha...',
      category: 'Kategoriya',
      coverEmoji: 'Muqova emojisi',
      saveMeta: 'Sozlamalarni saqlash',
    },
    aiSettings: {
      modalTitle: 'AI Provayder Sozlamalari',
      byokBadge: 'BYOK',
      subtitle: 'Gemini, OpenAI yoki boshqa mos keluvchi shlyuz uchun shaxsiy API kalit',
      presets: 'Tezkor sozlamalar:',
      baseUrl: 'Provayder Base URL',
      modelName: 'Model nomi',
      apiKey: 'API Kalit / Token',
      keyStorageNote: 'Faqat brauzerda saqlanadi',
      privacyNote: 'API kaliti faqat viktorina yaratish vaqtida lokal backend serverga yuboriladi va doimiy bazalarda saqlanmaydi. Har bir foydalanuvchi uchun alohida (localStorage).',
      testConnection: 'Ulanishni tekshirish',
      testing: 'Tekshirilmoqda...',
      testSuccess: 'AI bilan ulanish muvaffaqiyatli o\'rnatildi!',
      testError: 'Ulanishni tekshirishda xatolik',
      reset: 'Qaytarish',
      save: 'Saqlash',
      saved: 'Saqlandi!',
      showKey: 'Kalitni ko\'rsatish',
      hideKey: 'Kalitni yashirish',
    },
    aiTemplate: {
      modalTitleTemplates: 'Tayyor Savollar To\'plami',
      modalTitleGenerate: 'AI Savollar Generatori',
      subtitleTemplates: 'Tezkor boshlash uchun turli formatdagi muvozanatli savollar to\'plamlari',
      subtitleGenerate: 'Gemini/OpenAI yordamida istalgan mavzuda bir zumda savollar yaratish',
      tabTemplates: 'Tayyor to\'plamlar',
      tabGenerate: 'AI Generatsiyasi',
      searchPlaceholder: 'Mavzu yoki to\'plam nomi bo\'yicha qidiruv...',
      topicLabel: 'Viktorina mavzusi yoki asosiy tushunchalar:',
      topicPlaceholder: 'Masalan: Mikroservislar arxitekturasi, Garri Potter, Kvant fizikasi...',
      configureKey: 'Model / Kalitni sozlash',
      questionsCount: 'Savollar soni',
      difficulty: 'Qiyinlik darajasi',
      difficultyEasy: 'Oson',
      difficultyMedium: 'O\'rtacha',
      difficultyHard: 'Qiyin',
      language: 'Til',
      createBtn: 'Yaratish',
      creating: 'Yaratilmoqda...',
      regenerate: 'Qayta generatsiya',
      insertQuestions: '{count} ta savolni kiritish',
      packContent: '«{title}» to\'plami tarkibi:',
      fallbackWarning: '⚠️ Sun\'iy intellekt orqali generatsiya qilib bo\'lmadi ({reason}), demo shablon yuklandi.',
      notFound: 'So\'rovingiz bo\'yicha to\'plamlar topilmadi',
      questionsSuffix: 'savol',
    },
    aiChat: {
      botTitle: 'QuizArena AI Yordamchisi',
      botStatus: 'Onlayn • Savollar generatsiyasi',
      floatingTooltip: 'AI Bot Yordamchi',
      welcomeMsg: 'Salom! 👋 Men QuizArena AI yordamchisiman. Viktorina yaratishda qanday yordam bera olaman?',
      sampleUserMsg: 'Menga mavzu va nom asosida 3 ta savol yaratishga yordam bering',
      sampleAiMsg: 'Albatta! Mana "{topic}" mavzusi bo\'yicha 3 ta generatsiya qilingan savol:',
      inputPlaceholder: 'AI botga savol bering...',
      chipMoreQuestions: 'Yana 3 ta savol',
      chipHarder: '🎯 Qiyinroq savollar',
      chipTrueFalse: '⚡ True / False',
      generatedHeader: '3 ta savol generatsiya qilindi',
      decline: 'Rad etish',
      apply: 'Viktorinaga kiritish',
      appliedSuccess: 'Savollar viktorinaga kiritildi ✓',
      declinedStatus: 'Generatsiya rad etildi',
      appliedFollowup: '🎉 Ajoyib! 3 ta savol viktorinangizga muvaffaqiyatli qo\'shildi. Ularni istalgan vaqtda tahrirlashingiz mumkin.',
      declinedFollowup: 'Tushundim, bu savollar bekor qilindi. Boshqa variantlar kerak bo\'lsa menga yozing!',
      fallbackNotice: '⚠️ AI orqali generatsiya qilib bo\'lmadi ({reason}), "{topic}" bo\'yicha demo savollar taklif qilindi:',
      genericHelp: 'Yordam berishga tayyorman! "Python bo\'yicha 3 ta savol yarat" deb yozing yoki quyidagi tugmalarni bosing.',
      errorMsg: 'AI orqali savollar yaratib bo\'lmadi. API sozlamalarini tekshirib qaytadan urinib ko\'ring.',
    },
    host: {
      roomCode: 'Xona Kodi',
      waitingPlayers: 'O\'yinchilar kutilmoqda...',
      playersCount: 'Xonadagi o\'yinchilar: {count}',
      startGame: 'O\'yinni boshlash',
      addBot: '+ Bot',
      removeBot: '- Bot',
      botSpeed: 'Botlar tezligi',
      botAccuracy: 'Botlar aniqligi',
      copyLink: 'Havolani nusxalash',
      linkCopied: 'Havola nusxalandi!',
      powerUpsEnabled: 'Kuchaytirgichlar yoqilgan',
      nextQuestion: 'Keyingi savol',
      showAnswers: 'Javoblarni ko\'rsatish',
      leaderboard: 'Yetakchilar Jadvali',
      podium: 'G\'oliblar Shohsupasi',
      viewAnalytics: 'O\'yin Tahlili',
      totalPoints: '{points} ball',
      streak: 'Seriya: {count} 🔥',
      answersReceived: 'Javob berishdi: {count} / {total}',
      exitGame: 'O\'yinni yakunlash',
      exitConfirm: 'Haqiqatan ham o\'yinni yakunlamoqchimisiz?',
      returnHome: 'Asosiy sahifaga',
      winner: 'G\'olib!',
      accuracy: 'O\'rtacha aniqlik',
      fastestPlayer: 'Eng tezkor javob',
      downloadResults: 'Natijalarni yuklab olish (JSON)',
      questionOf: '{total} dan {current}-savol',
      timeRemaining: 'Qolgan vaqt',
      correctAnswersCount: '{count} ta to\'g\'ri javob',
      optionDistribution: 'O\'yinchilar javoblari taqsimoti',
      kickPlayer: 'O\'yinchini chiqarib yuborish',
      scanQrToJoin: 'QR kodni skanerlang yoki kirish sahifasini oching',
    },
    player: {
      enterPin: 'O\'yin PIN kodi',
      enterNickname: 'Sizning taxallusingiz',
      nicknamePlaceholder: 'Masalan: RocketPlayer',
      chooseAvatar: 'Avatarni tanlang',
      joinGame: 'O\'yinga kirish',
      connecting: 'Ulanmoqda...',
      youAreIn: 'Siz o\'yindasiz!',
      seeNameOnScreen: 'Ismingizni katta ekranda ko\'ryapsizmi?',
      waitHost: 'Boshlovchi o\'yinni boshlashini kuting...',
      correct: 'To\'g\'ri!',
      wrong: 'Noto\'g\'ri!',
      protectedByShield: 'Qalqon bilan himoyalandi!',
      pointsEarned: '+{points} ball',
      streakBonus: 'Seriya bonusi: +{points}',
      currentRank: 'O\'rin: #{rank}',
      answerSubmitted: 'Javob qabul qilindi! Boshqalarni kutmoqdamiz...',
      usePowerUp: 'Kuchaytirgichni ishlatish',
      powerUp5050: '50:50 (2 ta xatoni olib tashlash)',
      powerUp2x: 'Ushbu savol uchun 2x Ball',
      powerUpShield: '1 ta xatodan himoya qalqoni',
      powerUpFreeze: 'Savol taymerini muzlatish',
      finalRank: 'Yakuniy o\'rningiz: #{rank}',
      finalScore: 'Jami to\'plangan ball: {score}',
      playAgain: 'Qayta o\'ynash',
      submitAnswer: 'Javobni yuborish',
      typeYourAnswer: 'Javobingizni yozing...',
      enterNumber: 'Sonni kiriting...',
      orderHint: 'Elementlarni to\'g\'ri tartibda joylashtiring',
      pollThanks: 'Ovozingiz uchun rahmat!',
      frozenAlert: 'Taymer muzlatildi!',
    },
  },
};
