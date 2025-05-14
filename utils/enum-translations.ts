import { 
  VideoContentStyle, 
  VideoLength, 
  VideoTargetInterest, 
  VideoType, 
  ExperienceLevel, 
  ScriptTone,
  ScriptVerbosity,
  ScriptTarget,
  ScriptType,
  ScriptDuration,
  ScriptPersona,
  ScriptStructure
} from "@/types/enum";

/**
 * Sistema di traduzione semplificato per gli enum
 * 
 * Ogni enum ha un oggetto di traduzioni per lingua.
 * La chiave è il valore dell'enum, il valore è un oggetto con traduzioni per lingua.
 */

// Traduzioni per VideoContentStyle
export const VideoContentStyleTranslations = {
  [VideoContentStyle.Educational]: {
    it: 'Educativo',
    es: 'Educativo',
    fr: 'Éducatif'
  },
  [VideoContentStyle.Entertainment]: {
    it: 'Intrattenimento',
    es: 'Entretenimiento',
    fr: 'Divertissement'
  },
  [VideoContentStyle.Inspirational]: {
    it: 'Inspirativo',
    es: 'Inspirativo',
    fr: 'Inspirant'
  },
  [VideoContentStyle.News]: {
    it: 'Notizie',
    es: 'Noticias',
    fr: 'Nouvelles'
  },
  [VideoContentStyle.Documentary]: {
    it: 'Documentario',
    es: 'Documental',
    fr: 'Documentaire'
  },
  [VideoContentStyle.Comedy]: {
    it: 'Commedia',
    es: 'Comedia',
    fr: 'Comédie'
  },
  [VideoContentStyle.Tutorial]: {
    it: 'Tutorial',
    es: 'Tutorial',
    fr: 'Tutoriel'
  },
  [VideoContentStyle.Review]: {
    it: 'Recensione',
    es: 'Reseña',
    fr: 'Critique'
  },
  [VideoContentStyle.Gaming]: {
    it: 'Gaming',
    es: 'Gaming',
    fr: 'Gaming'
  },
  [VideoContentStyle.Vlog]: {
    it: 'Vlog',
    es: 'Vlog',
    fr: 'Vlog'
  },
  [VideoContentStyle.StoryDriven]: {
    it: 'Story Driven',
    es: 'Story Driven',
    fr: 'Story Driven'
  },
  [VideoContentStyle.Analysis]: {
    it: 'Analisi',
    es: 'Análisis',
    fr: 'Analyse'
  },
  [VideoContentStyle.BehindTheScenes]: {
    it: 'Dietro le quinte',
    es: 'Behind the scenes',
    fr: 'Behind the scenes'
  },
  [VideoContentStyle.ASMR]: {
    it: 'ASMR',
    es: 'ASMR',
    fr: 'ASMR'
  },
  [VideoContentStyle.Satire]: {
    it: 'Satira',
    es: 'Satira',
    fr: 'Satire'
  },
  [VideoContentStyle.Cinematic]: {
    it: 'Cinematica',
    es: 'Cinematica',
    fr: 'Cinématique'
  },
  [VideoContentStyle.Experimental]: {
    it: 'Sperimentale',
    es: 'Experimental',
    fr: 'Expérimental'
  },
  [VideoContentStyle.Motivational]: {
    it: 'Motivazionale',
    es: 'Motivacional',
    fr: 'Motivant'
  },
  [VideoContentStyle.DarkHumor]: {
    it: 'Humor nero',
    es: 'Humor negro',
    fr: 'Humour noir'
  },
  [VideoContentStyle.Explainer]: {
    it: 'Spiegazione',
    es: 'Explicacion',
    fr: 'Explication'
  },
  [VideoContentStyle.VisualStorytelling]: {
    it: 'Narrativa visiva',
    es: 'Narrativa visual',
    fr: 'Narrative visuelle'
  },
  [VideoContentStyle.HorrorNarrative]: {
    it: 'Narrativa horror',
    es: 'Narrativa de horror',
    fr: 'Narrative de terror'
  },
  [VideoContentStyle.Philosophical]: {
    it: 'Filosofico',
    es: 'Filosófico',
    fr: 'Philosophique'
  },
  [VideoContentStyle.TrendAnalysis]: {
    it: 'Analisi di tendenza',
    es: 'Análisis de tendencia',
    fr: 'Analyse de tendance'
  },
  [VideoContentStyle.TechFuturism]: {
    it: 'Futurismo tecnológico',
    es: 'Futurismo tecnológico',
    fr: 'Futurisme technologique'
  },
  [VideoContentStyle.AIGeneratedContent]: {
    it: 'Contenido generado por IA',
    es: 'Contenido generado por IA',
    fr: 'Contenu généré par IA'
  },
  [VideoContentStyle.Interactive]: {
    it: 'Interattivo',
    es: 'Interactivo',
    fr: 'Interactif'
  },
  [VideoContentStyle.DataDriven]: {
    it: 'Datadriven',
    es: 'Datadriven',
    fr: 'Datadriven'
  },
  [VideoContentStyle.StepByStep]: {
    it: 'Passo per passo',
    es: 'Paso a paso',
    fr: 'Pas à pas'
  },
  [VideoContentStyle.CaseBased]: {
    it: 'Case based',
    es: 'Case based',
    fr: 'Case based'
  },
  [VideoContentStyle.ProblemSolution]: {
    it: 'Problem solution',
    es: 'Problem solution',
    fr: 'Problem solution'
  },
  [VideoContentStyle.DebateStyle]: {
    it: 'Dibattito',
    es: 'Debate',
    fr: 'Débat'
  },
  [VideoContentStyle.InterviewStyle]: {
    it: 'Intervista',
    es: 'Entrevista',
    fr: 'Entretien'
  },
  [VideoContentStyle.WorkshopStyle]: {
    it: 'Workshop',
    es: 'Workshop',
    fr: 'Atelier'
  },
  [VideoContentStyle.QuickTips]: {
    it: 'Consigli veloci',
    es: 'Consejos rápidos',
    fr: 'Conseils rapides'
  },
  [VideoContentStyle.DeepDive]: {
    it: 'Deep dive',
    es: 'Deep dive',
    fr: 'Deep dive'
  }
};

// Traduzioni per VideoLength
export const VideoLengthTranslations = {
  [VideoLength.ShortsReels]: {
    it: 'shorts/reels',
    es: 'shorts/reels',
    fr: 'shorts/reels'
  },
  [VideoLength.UnderFiveMin]: {
    it: 'meno di 5 min',
    es: 'menos de 5 min',
    fr: 'moins de 5 min'
  },
  [VideoLength.FiveToTenMin]: {
    it: '5-10 min',
    es: '5-10 min',
    fr: '5-10 min'
  },
  [VideoLength.TenToTwentyMin]: {
    it: '10-20 min',
    es: '10-20 min',
    fr: '10-20 min'
  },
  [VideoLength.TwentyPlusMin]: {
    it: '20+ min',
    es: '20+ min',
    fr: '20+ min'
  }
};

// Traduzioni per ExperienceLevel
export const ExperienceLevelTranslations = {
  [ExperienceLevel.Beginner]: {
    it: 'Principiante',
    es: 'Principiante',
    fr: 'Débutant'
  },
  [ExperienceLevel.Intermediate]: {
    it: 'Intermedio',
    es: 'Intermedio',
    fr: 'Intermédiaire'
  },
  [ExperienceLevel.Advanced]: {
    it: 'Esperto',
    es: 'Experto',
    fr: 'Expert'
  }
};

// Traduzioni per VideoTargetInterest (aggiungi solo quelle che ti servono)
export const VideoTargetInterestTranslations = {
  [VideoTargetInterest.Tech]: {
    it: 'Tecnologia',
    es: 'Tecnología',
    fr: 'Technologie'
  },
  [VideoTargetInterest.Fitness]: {
    it: 'Fitness',
    es: 'Fitness',
    fr: 'Fitness'
  },
  [VideoTargetInterest.Finance]: {
    it: 'Finanza',
    es: 'Finanzas',
    fr: 'Finance'
  },
  [VideoTargetInterest.Education]: {
    it: 'Educazione',
    es: 'Educación',
    fr: 'Éducation'
  },
  [VideoTargetInterest.SelfImprovement]: {
    it: 'Miglioramento personale',
    es: 'Desarrollo personal',
    fr: 'Développement personnel'
  },
  [VideoTargetInterest.Fashion]: {
    it: 'Moda',
    es: 'Moda',
    fr: 'Mode'
  },
  [VideoTargetInterest.Cooking]: {
    it: 'Cucina',
    es: 'Cocina',
    fr: 'Cuisine'
  },
  [VideoTargetInterest.Gaming]: {
    it: 'Gaming',
    es: 'Gaming',
    fr: 'Gaming'
  },
  [VideoTargetInterest.Travel]: {
    it: 'Viaggi',
    es: 'Viajes',
    fr: 'Voyages'
  },
  [VideoTargetInterest.Music]: {
    it: 'Musica',
    es: 'Música',
    fr: 'Musique'
  },
  [VideoTargetInterest.Art]: {
    it: 'Arte',
    es: 'Arte',
    fr: 'Art'
  },
  [VideoTargetInterest.Entrepreneurship]: {
    it: 'Imprenditorialità',
    es: 'Emprendimiento',
    fr: 'Entreprise'
  },
  [VideoTargetInterest.Science]: {
    it: 'Scienza',
    es: 'Ciencia',
    fr: 'Science'
  },
  [VideoTargetInterest.Health]: {
    it: 'Salute',
    es: 'Salud',
    fr: 'Santé'
  },
  [VideoTargetInterest.Automotive]: {
    it: 'Automotive',
    es: 'Automóvil',
    fr: 'Automobile'
  },
  [VideoTargetInterest.Productivity]: {
    it: 'Produttività',
    es: 'Productividad',
    fr: 'Productivité'
  },
  [VideoTargetInterest.Psychology]: {
    it: 'Psicologia',
    es: 'Psicología',
    fr: 'Psycologie'
  },
  [VideoTargetInterest.Sports]: {
    it: 'Sport',
    es: 'Deporte',
    fr: 'Sport'
  },
  [VideoTargetInterest.Parenting]: {
    it: 'Parentela',
    es: 'Parentela',
    fr: 'Parentela'
  },
  [VideoTargetInterest.MoviesAndTV]: {
    it: 'Film e TV',
    es: 'Películas y TV',
    fr: 'Film et TV'
  },
  [VideoTargetInterest.History]: {
    it: 'Storia',
    es: 'Historia',
    fr: 'Histoire'
  },
  [VideoTargetInterest.DIYAndCrafts]: {
    it: 'DIY e Craft',
    es: 'DIY y Craft',
    fr: 'DIY et Craft'
  },
  [VideoTargetInterest.Business]: {
    it: 'Affari',
    es: 'Negocios',
    fr: 'Affaires'
  },
  [VideoTargetInterest.ASMR]: {
    it: 'ASMR',
    es: 'ASMR',
    fr: 'ASMR'
  },
  [VideoTargetInterest.Horror]: {
    it: 'Horror',
    es: 'Horror',
    fr: 'Horror'
  },
  [VideoTargetInterest.Sustainability]: {
    it: 'Sostenibilità',
    es: 'Sostenibilidad',
    fr: 'Sustainabilité'
  },
  [VideoTargetInterest.BlockchainAndCrypto]: {
    it: 'Blockchain e Crypto',
    es: 'Blockchain y Crypto',
    fr: 'Blockchain et Crypto'
  },
  [VideoTargetInterest.SpaceAndAstronomy]: {
    it: 'Spazio e Astronomia',
    es: 'Espacio y Astronomía',
    fr: 'Espace et Astronomie'
  },
  [VideoTargetInterest.PetsAndAnimals]: {
    it: 'Animali e Mascotte',
    es: 'Animales y Mascotas',
    fr: 'Animaux et Mascottes'
  },
  [VideoTargetInterest.FoodScience]: {
    it: 'Scienza della Cucina',
    es: 'Ciencia de la Cocina',
    fr: 'Science de la Cuisine'
  },
  [VideoTargetInterest.MindfulnessAndMeditation]: {
    it: 'Mindfulness e Meditazione',
    es: 'Mindfulness y Meditación',
    fr: 'Mindfulness et Méditation'
  },
  [VideoTargetInterest.MythologyAndFolklore]: {
    it: 'Mitologia e Cultura Popolare',
    es: 'Mitología y Cultura Popular',
    fr: 'Mythologie et Culture Populaire'
  },
  [VideoTargetInterest.SurvivalAndOutdoors]: {
    it: 'Survival e Outdoor',
    es: 'Supervivencia y Outdoor',
    fr: 'Survival et Outdoor'
  },
  [VideoTargetInterest.LanguagesAndLinguistics]: {
    it: 'Lingue e Linguistica',
    es: 'Idiomas y Lingüística',
    fr: 'Langues et Linguistique'
  },
  [VideoTargetInterest.ESports]: {
    it: 'E-Sport',
    es: 'E-Sport',
    fr: 'E-Sport'
  },
  [VideoTargetInterest.TrueCrime]: {
    it: 'True Crime',
    es: 'True Crime',
    fr: 'True Crime'
  },
  [VideoTargetInterest.Programming]: {
    it: 'Programmazione',
    es: 'Programación',
    fr: 'Programmation'
  }
};

// Traduzioni per VideoType
export const VideoTypeTranslations = {
  [VideoType.Tutorial]: {
    it: 'Tutorial',
    es: 'Tutorial',
    fr: 'Tutoriel'
  },
  [VideoType.Review]: {
    it: 'Recensione',
    es: 'Reseña',
    fr: 'Critique'
  },
  [VideoType.Reaction]: {
    it: 'Reazione',
    es: 'Reacción',
    fr: 'Réaction'
  },
  [VideoType.Documentary]: {
    it: 'Documentario',
    es: 'Documental',
    fr: 'Documentaire'
  },
  [VideoType.Vlog]: {
    it: 'Vlog',
    es: 'Vlog',
    fr: 'Vlog'
  },
  [VideoType.QAndA]: {
    it: 'Domande e Risposte',
    es: 'Preguntas y Respuestas',
    fr: 'Questions et Réponses'
  },
  [VideoType.Podcast]: {
    it: 'Podcast',
    es: 'Podcast',
    fr: 'Podcast'
  },
  [VideoType.LiveStreaming]: {
    it: 'Diretta Live',
    es: 'Live Streaming',
    fr: 'Live Streaming'
  },
  [VideoType.BehindTheScenes]: {
    it: 'Dietro le quinte',
    es: 'Behind the scenes',
    fr: 'Behind the scenes'
  },
  [VideoType.Challenge]: {
    it: 'Challenge',
    es: 'Desafío',
    fr: 'Défi'
  },
  [VideoType.Interview]: {
    it: 'Intervista',
    es: 'Entrevista',
    fr: 'Entretien'
  },
  [VideoType.SketchComedy]: {
    it: 'Sketc',
    es: 'Sketc',
    fr: 'Sketc'
  },
  [VideoType.Unboxing]: {
    it: 'Unboxing',
    es: 'Unboxing',
    fr: 'Unboxing'
  },
  [VideoType.Parody]: {
    it: 'Parodia',
    es: 'Parodia',
    fr: 'Parodie'
  },
  [VideoType.TimeLapse]: {
    it: 'Time-Lapse',
    es: 'Time-Lapse',
    fr: 'Time-Lapse'
  },
  [VideoType.MiniDocumentary]: {
    it: 'Mini Documentario',
    es: 'Mini Documentario',
    fr: 'Mini Documentaire'
  },
  [VideoType.TutorialSeries]: {
    it: 'Serie di Tutorial',
    es: 'Serie de Tutoriales',
    fr: 'Série de Tutoriels'
  },
  [VideoType.Experiments]: {
    it: 'Esperimenti',
    es: 'Experimentos',
    fr: 'Expériences'
  },
  [VideoType.FanTheories]: {
    it: 'Teorie dei Fan',
    es: 'Teorías de los Fans',
    fr: 'Théories des Fans'
  },
  [VideoType.Compilation]: {
    it: 'Compilazione',
    es: 'Compilación',
    fr: 'Compilation'
  },
  [VideoType.Storytelling]: {
    it: 'Narrativa',
    es: 'Narrativa',
    fr: 'Narrative'
  },
  [VideoType.AnimatedExplainer]: {
    it: 'Animazione',
    es: 'Animación',
    fr: 'Animation'
  },
  [VideoType.Speedrun]: {
    it: 'Speedrun',
    es: 'Speedrun',
    fr: 'Speedrun'
  },
  [VideoType.Comparison]: {
    it: 'Confronto',
    es: 'Comparación',
    fr: 'Comparaison'
  },
  [VideoType.TierList]: {
    it: 'Tier List',
    es: 'Tier List',
    fr: 'Tier List'
  },
  [VideoType.BehindTheMusic]: {
    it: 'Dietro la musica',
    es: 'Behind the music',
    fr: 'Behind the music'
  },
  [VideoType.MysterySolving]: {
    it: 'Mystery Solving',
    es: 'Mystery Solving',
    fr: 'Mystery Solving'
  },
  [VideoType.ParanormalInvestigation]: {
    it: 'Investigazione Paranormale',
    es: 'Investigación Paranormal',
    fr: 'Investigation Paranormale'
  },
  [VideoType.TechBreakdown]: {
    it: 'Scomposizione Tecnica',
    es: 'Desglose Técnico',
    fr: 'Décomposition Technique'
  },
  [VideoType.BuildAndCreate]: {
    it: 'Costruisci e Crea',
    es: 'Construir y Crear',
    fr: 'Construire et Créer'
  },
  [VideoType.ProductReview]: {
    it: 'Recensione Prodotto',
    es: 'Reseña de Producto',
    fr: 'Avis de Produit'
  },
  [VideoType.SoftwareTutorial]: {
    it: 'Tutorial Software',
    es: 'Tutorial de Software',
    fr: 'Tutoriel de Logiciel'
  },
  [VideoType.CaseStudy]: {
    it: 'Caso studio',
    es: 'Estudio de Caso',
    fr: 'Étude de Cas'
  },
  [VideoType.ExpertInterview]: {
    it: 'Intervista Esperto',
    es: 'Entrevista a Experto',
    fr: 'Entretien à Expert'
  },
  [VideoType.NewsAnalysis]: {
    it: 'Analisi di Notizie',
    es: 'Análisis de Noticias',
    fr: 'Analyse de Nouvelles'
  },
  [VideoType.HowToGuide]: {
    it: 'Guida per Fare',
    es: 'Guía para Hacer',
    fr: 'Guide pour Faire'
  },
  [VideoType.IndustryInsights]: {
    it: 'Informazioni Industria',
    es: 'Información de la Industria',
    fr: 'Informations de l\'Industrie'
  },
  [VideoType.ToolComparison]: {
    it: 'Confronto Strumenti',
    es: 'Comparación de Herramientas',
    fr: 'Comparaison d\'Outils'
  },
  [VideoType.SuccessStory]: {
    it: 'Storia di Successo',
    es: 'Historia de Éxito',
    fr: 'Histoire de Réussite'
  },
  [VideoType.Troubleshooting]: {
    it: 'Risoluzione Problemi',
    es: 'Resolución de Problemas',
    fr: 'Résolution de Problèmes'
  }
};

export const ScriptToneTranslations = {
  [ScriptTone.Formal]: {
    it: 'Formale',
    es: 'Formal',
    fr: 'Formel'
  },
  [ScriptTone.Informal]: {
    it: 'Informale',
    es: 'Informal',
    fr: 'Informal'
  },
  [ScriptTone.Playful]: {
    it: 'Giocoso',
    es: 'Jocoso',
    fr: 'Jocoso'
  },
  [ScriptTone.Serious]: {
    it: 'Serio',
    es: 'Serio',
    fr: 'Sérieux'
  },
  [ScriptTone.Inspirational]: {
    it: 'Inspirato',
    es: 'Inspirado',
    fr: 'Inspiré'
  },
  [ScriptTone.Humorous]: {
    it: 'Humoristico',
    es: 'Humorístico',
    fr: 'Humoristique'
  },
  [ScriptTone.Dramatic]: {
    it: 'Drammatico',
    es: 'Dramático',
    fr: 'Dramatique'
  },
  [ScriptTone.Neutral]: {
    it: 'Neutrale',
    es: 'Neutral',
    fr: 'Neutre'
  }
}

export const ScriptVerbosityTranslations = {
  [ScriptVerbosity.Short]: {
    it: 'Corto',
    es: 'Corto',
    fr: 'Court'
  },
  [ScriptVerbosity.Medium]: {
    it: 'Medio',
    es: 'Medio',
    fr: 'Moyen'
  },
  [ScriptVerbosity.Long]: {
    it: 'Lungo',
    es: 'Largo',
    fr: 'Long'
  },
  [ScriptVerbosity.VeryLong]: {
    it: 'Molto lungo',
    es: 'Muy largo',
    fr: 'Très long'
  }
}

export const ScriptTargetTranslations = {
  [ScriptTarget.Children]: {
    it: 'Bambini',
    es: 'Niños',
    fr: 'Enfants'
  },
  [ScriptTarget.Teenagers]: {
    it: 'Adolescenti',
    es: 'Adolescentes',
    fr: 'Adolescents'
  },
  [ScriptTarget.YoungAdults]: {
    it: 'Giovani adulti',
    es: 'Jóvenes adultos',
    fr: 'Jeunes adultes'
  },
  [ScriptTarget.Adults]: {
    it: 'Adulti',
    es: 'Adultos',
    fr: 'Adultes'
  },
  [ScriptTarget.Professionals]: {
    it: 'Professionisti',
    es: 'Profesionales',
    fr: 'Professionnels'
  },
  [ScriptTarget.General]: {
    it: 'Generale',
    es: 'General',
    fr: 'Général'
  }
}

export const ScriptTypeTranslations = {
  [ScriptType.Educational]: {
    it: 'Educativo',
    es: 'Educativo',
    fr: 'Éducatif'
  },
  [ScriptType.Promotional]: {
    it: 'Promozionale',
    es: 'Promocional',
    fr: 'Promotionnel'
  },
  [ScriptType.Storytelling]: {
    it: 'Narrativa',  
    es: 'Narrativa',
    fr: 'Narrative'
  },
  [ScriptType.Tutorial]: {
    it: 'Tutorial',
    es: 'Tutorial',
    fr: 'Tutoriel'
  },
  [ScriptType.Review]: {
    it: 'Recensione',
    es: 'Reseña',
    fr: 'Critique'
  },
  [ScriptType.News]: {
    it: 'Notizie',
    es: 'Noticias',
    fr: 'Nouvelles'
  },
  [ScriptType.Interview]: {
    it: 'Intervista',
    es: 'Entrevista',
    fr: 'Entretien'
  },
  [ScriptType.Debate]: {
    it: 'Debate',
    es: 'Debate',
    fr: 'Débat'
  },
  [ScriptType.Motivational]: {
    it: 'Motivazionale',
    es: 'Motivacional',
    fr: 'Motivant'
  },
  [ScriptType.Comedy]: {
    it: 'Commedia',
    es: 'Comedia',
    fr: 'Comédie'
  }
}

export const ScriptDurationTranslations = {
  [ScriptDuration.min_2]: {
    it: '2 minuti',
    es: '2 minutos',
    fr: '2 minutes'
  },
  [ScriptDuration.min_5]: {
    it: '5 minuti',
    es: '5 minutos',
    fr: '5 minutes'
  },
  [ScriptDuration.min_10]: {
    it: '10 minuti',
    es: '10 minutos',
    fr: '10 minutes'
  },
  [ScriptDuration.min_15]: {
    it: '15 minuti',
    es: '15 minutos',
    fr: '15 minutes'
  },
  [ScriptDuration.min_20]: {
    it: '20 minuti',
    es: '20 minutos',
    fr: '20 minutes'
  },
  [ScriptDuration.min_30]: {
    it: '30 minuti',
    es: '30 minutos',
    fr: '30 minutes'
  }
}

export const ScriptPersonaTranslations = {
  [ScriptPersona.Expert]: {
    it: 'Esperto',
    es: 'Experto',
    fr: 'Expert'
  },
  [ScriptPersona.Friend]: {
    it: 'Amico',
    es: 'Amigo',
    fr: 'Ami'
  },
  [ScriptPersona.Coach]: {
    it: 'Coach',
    es: 'Coach',
    fr: 'Coach'
  },
  [ScriptPersona.Comedian]: {
    it: 'Comico',
    es: 'Comico',
    fr: 'Comique'
  },
  [ScriptPersona.Journalist]: {
    it: 'Giornalista',
    es: 'Periodista',
    fr: 'Journaliste'
  },
  [ScriptPersona.Robot]: {
    it: 'Robot',
    es: 'Robot',
    fr: 'Robot'
  },
  [ScriptPersona.Teacher]: {
    it: 'Insegnante',
    es: 'Profesor',
    fr: 'Professeur'
  },
  [ScriptPersona.Influencer]: {
    it: 'Influencer',
    es: 'Influencer',
    fr: 'Influenceur'
  }  
}

export const ScriptStructureTranslations = {
  [ScriptStructure.hook_then_content]: {
    it: 'Hook then content',
    es: 'Hook then content',
    fr: 'Hook then content'
  },
  [ScriptStructure.chronological]: {
    it: 'Cronologico',
    es: 'Cronológico',
    fr: 'Chronologique'
  },
  [ScriptStructure.problem_solution]: {
    it: 'Problema e soluzione',
    es: 'Problema y solución',
    fr: 'Problème et solution'
  },
  [ScriptStructure.question_answer]: {
    it: 'Domanda e risposta',
    es: 'Pregunta y respuesta',
    fr: 'Question et réponse'
  },
  [ScriptStructure.listicle]: {
    it: 'Listicle',
    es: 'Listicle',
    fr: 'Listicle'
  },
  [ScriptStructure.case_study]: {
    it: 'Storia di successo',
    es: 'Caso de éxito',
    fr: 'Cas d\'éxito'
  },
  [ScriptStructure.before_after_bridge]: {
    it: 'Prima e dopo',
    es: 'Antes y después',
    fr: 'Avant et après'
  }
}
/**
 * Restituisce la traduzione per un valore di enum.
 * Se la traduzione non esiste, restituisce il valore originale.
 */
export function getEnumTranslation(value: string, locale: string = 'en'): string {
  if (locale === 'en') return value;
  
  // Cerca in tutte le tabelle di traduzione
  const allTranslations = [
    VideoContentStyleTranslations,
    VideoLengthTranslations,
    VideoTargetInterestTranslations,
    VideoTypeTranslations,
    ExperienceLevelTranslations,
    ScriptToneTranslations,
    ScriptVerbosityTranslations,
    ScriptTargetTranslations,
    ScriptTypeTranslations,
    ScriptDurationTranslations,
    ScriptPersonaTranslations,
    ScriptStructureTranslations
  ];
  
  for (const translations of allTranslations) {
    if (translations[value as keyof typeof translations] && translations[value as keyof typeof translations][locale]) {
      return translations[value as keyof typeof translations][locale];
    }
  }
  
  return value;
}

/**
 * Restituisce l'array di opzioni tradotte
 */
export function getTranslatedOptions(options: string[], locale: string = 'en'): string[] {
  if (locale === 'en') return options;
  return options.map(option => getEnumTranslation(option, locale));
}

/**
 * Converte un valore tradotto nel valore originale dell'enum
 */
export function getOriginalValue(translatedValue: string, options: string[], locale: string = 'en'): string {
  if (locale === 'en') return translatedValue;
  
  // Cerca in tutte le tabelle di traduzione
  const allTranslations = [
    VideoContentStyleTranslations,
    VideoLengthTranslations,
    VideoTargetInterestTranslations,
    VideoTypeTranslations,
    ExperienceLevelTranslations,
    ScriptToneTranslations,
    ScriptVerbosityTranslations,
    ScriptTargetTranslations,
    ScriptTypeTranslations,
    ScriptDurationTranslations,
    ScriptPersonaTranslations,
    ScriptStructureTranslations
  ];
  
  for (const translations of allTranslations) {
    for (const [originalValue, locales] of Object.entries(translations)) {
      if (locales[locale as keyof typeof locales] === translatedValue && options.includes(originalValue)) {
        return originalValue;
      }
    }
  }
  
  return translatedValue;
} 