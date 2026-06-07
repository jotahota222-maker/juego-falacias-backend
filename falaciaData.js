/**
 * FALACIA DATA MODULE
 * Extracted and structured from the uploaded fallacies document.
 * Each entry has: id, category, subcategory, scenario, question, correctAnswer, distractors.
 */

const CATEGORIES = {
  ATINENCIA: "Falacia de Atinencia",
  AMBIGUEDAD: "Falacia de Ambigüedad",
  NO_FALACIA: "No es una falacia",
};

const FALLACY_NAMES = {
  AD_BACULUM: "Apelación a la Fuerza (Ad Baculum)",
  AD_HOMINEM_OF: "Ad Hominem Ofensivo",
  AD_HOMINEM_CIRC: "Ad Hominem Circunstancial",
  AD_IGNORANTIAM: "Apelación a la Ignorancia (Ad Ignorantiam)",
  AD_MISERICORDIAM: "Apelación a la Piedad (Ad Misericordiam)",
  AD_POPULUM: "Apelación al Pueblo (Ad Populum)",
  AD_VERECUNDIAM: "Apelación a la Autoridad (Ad Verecundiam)",
  GEN_APRESURADA: "Generalización Apresurada",
  CAUSA_FALSA: "Causa Falsa",
  PREGUNTA_COMPLEJA: "Pregunta Compleja",
  EQUIVOCO: "El Equívoco",
  ANFIBOLOGIA: "Anfibología",
  ENFASIS: "El Énfasis",
  COMPOSICION: "La Composición",
  DIVISION: "La División",
};

// All pool distractors available for wrong answers
const ALL_WRONG_OPTIONS = [
  FALLACY_NAMES.AD_BACULUM,
  FALLACY_NAMES.AD_HOMINEM_OF,
  FALLACY_NAMES.AD_HOMINEM_CIRC,
  FALLACY_NAMES.AD_IGNORANTIAM,
  FALLACY_NAMES.AD_MISERICORDIAM,
  FALLACY_NAMES.AD_POPULUM,
  FALLACY_NAMES.AD_VERECUNDIAM,
  FALLACY_NAMES.GEN_APRESURADA,
  FALLACY_NAMES.CAUSA_FALSA,
  FALLACY_NAMES.PREGUNTA_COMPLEJA,
  FALLACY_NAMES.EQUIVOCO,
  FALLACY_NAMES.ANFIBOLOGIA,
  FALLACY_NAMES.ENFASIS,
  FALLACY_NAMES.COMPOSICION,
  FALLACY_NAMES.DIVISION,
  CATEGORIES.NO_FALACIA,
  CATEGORIES.ATINENCIA,
  CATEGORIES.AMBIGUEDAD,
];

const FALLACIES = [
  // ─── AD BACULUM ───────────────────────────────────────────────────────────
  {
    id: "bac_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.AD_BACULUM,
    scenario:
      "En un trabajo grupal, un compañero dice: «Más vale que estén de acuerdo conmigo sobre cómo hacer el trabajo, porque si no después no los ayudo cuando necesiten algo.»",
    question: "¿Qué tipo de falacia comete este compañero?",
    correctAnswer: FALLACY_NAMES.AD_BACULUM,
    hint: "Se usa presión o amenaza en lugar de razones para convencer.",
  },
  {
    id: "bac_02",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.AD_BACULUM,
    scenario:
      "En un equipo de fútbol del colegio están eligiendo capitán. Uno dice: «Elijanme a mí como capitán, porque si no después no les voy a pasar la pelota en los partidos.»",
    question: "¿Qué falacia se comete en este argumento?",
    correctAnswer: FALLACY_NAMES.AD_BACULUM,
    hint: "No da razones válidas: solo amenaza con una consecuencia negativa.",
  },

  // ─── AD HOMINEM OFENSIVO ──────────────────────────────────────────────────
  {
    id: "hom_of_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.AD_HOMINEM_OF,
    scenario:
      "Martina dice: «Deberíamos tener más horas de Ed. Física porque ayuda a la salud.» Tomás responde: «Vos no podés opinar de salud si nunca hacés deporte.»",
    question: "La respuesta de Tomás es un ejemplo de…",
    correctAnswer: FALLACY_NAMES.AD_HOMINEM_OF,
    hint: "Se ataca a la persona en vez de refutar su argumento.",
  },

  // ─── AD HOMINEM CIRCUNSTANCIAL ────────────────────────────────────────────
  {
    id: "hom_circ_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.AD_HOMINEM_CIRC,
    scenario:
      "Sofía dice que deberían tener más horas de Ed. Física. Martín responde: «Obvio que decís eso, si vos jugás al hockey y te conviene tener más horas de deporte.»",
    question: "¿Qué falacia comete Martín?",
    correctAnswer: FALLACY_NAMES.AD_HOMINEM_CIRC,
    hint: "Se descarta la idea atacando las circunstancias personales del que habla.",
  },

  // ─── AD IGNORANTIAM ───────────────────────────────────────────────────────
  {
    id: "ign_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.AD_IGNORANTIAM,
    scenario:
      "Unos estudiantes dicen: «Seguro hay un fantasma en la escuela, porque nadie pudo demostrar que no exista.»",
    question: "¿Qué falacia contiene este razonamiento?",
    correctAnswer: FALLACY_NAMES.AD_IGNORANTIAM,
    hint: "Se afirma que algo es verdadero solo porque no se demostró que es falso.",
  },

  // ─── AD MISERICORDIAM ─────────────────────────────────────────────────────
  {
    id: "mis_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.AD_MISERICORDIAM,
    scenario:
      "Un alumno le dice a la profesora: «Por favor apruébeme el examen. Si me desaprueba, mis padres se van a enojar muchísimo y voy a pasar unas vacaciones horribles.»",
    question: "¿Qué tipo de falacia usa el alumno para pedir que lo aprueben?",
    correctAnswer: FALLACY_NAMES.AD_MISERICORDIAM,
    hint: "Se apela a la lástima o compasión en lugar de a razones académicas.",
  },

  // ─── AD POPULUM ───────────────────────────────────────────────────────────
  {
    id: "pop_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.AD_POPULUM,
    scenario:
      "Un comercial dice: «El 90% de los jóvenes ya consumen nuestra bebida energizante. ¡No te quedes afuera y sumate a la nueva ola!»",
    question: "¿Qué falacia usa este comercial para vender su producto?",
    correctAnswer: FALLACY_NAMES.AD_POPULUM,
    hint: "Se intenta convencer apelando al entusiasmo de la mayoría.",
  },

  // ─── AD VERECUNDIAM ───────────────────────────────────────────────────────
  {
    id: "ver_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.AD_VERECUNDIAM,
    scenario:
      "En un debate de economía, alguien dice: «Einstein dijo que el libre mercado no funciona, así que esa teoría económica debe ser incorrecta.»",
    question: "¿Qué falacia se comete al apelar a Einstein en un debate de economía?",
    correctAnswer: FALLACY_NAMES.AD_VERECUNDIAM,
    hint: "Se apela a una autoridad fuera de su campo de especialidad.",
  },

  // ─── GENERALIZACIÓN APRESURADA ───────────────────────────────────────────
  {
    id: "gen_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.GEN_APRESURADA,
    scenario:
      "«En el certamen participaron tres alumnos del Colegio Nacional y ninguno pasó la primera ronda. Eso demuestra que el nivel educativo de todo el Colegio Nacional es malo.»",
    question: "¿Qué error lógico contiene este razonamiento?",
    correctAnswer: FALLACY_NAMES.GEN_APRESURADA,
    hint: "Se saca una conclusión universal basándose en muy pocos casos.",
  },

  // ─── CAUSA FALSA ──────────────────────────────────────────────────────────
  {
    id: "caus_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.CAUSA_FALSA,
    scenario:
      "«Me puse una pulsera roja para rendir el examen. Aprobé con buena nota, así que la pulsera roja me hizo aprobar.»",
    question: "¿Qué falacia comete quien atribuye su aprobación a la pulsera?",
    correctAnswer: FALLACY_NAMES.CAUSA_FALSA,
    hint: "Se confunde una coincidencia o secuencia temporal con una relación de causa y efecto.",
  },
  {
    id: "caus_02",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.CAUSA_FALSA,
    scenario:
      "Un alumno dice: «Aprobé porque usé la pulsera roja. La vez pasada no la traje y me fue mal.» Sus compañeros empezaron a usar pulseras parecidas.",
    question: "¿Qué falacia está en la base de esta creencia?",
    correctAnswer: FALLACY_NAMES.CAUSA_FALSA,
    hint: "Ocurrió antes, por lo tanto fue la causa: eso no es suficiente evidencia.",
  },

  // ─── PREGUNTA COMPLEJA ────────────────────────────────────────────────────
  {
    id: "preg_01",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.PREGUNTA_COMPLEJA,
    scenario: "Alguien le pregunta a un compañero: «¿Cuándo vas a dejar de copiarte en los exámenes?»",
    question: "¿Por qué esta pregunta es falaz?",
    correctAnswer: FALLACY_NAMES.PREGUNTA_COMPLEJA,
    hint: "La pregunta supone como verdadera una afirmación que nunca fue demostrada.",
  },
  {
    id: "preg_02",
    category: CATEGORIES.ATINENCIA,
    fallacyName: FALLACY_NAMES.PREGUNTA_COMPLEJA,
    scenario: "Durante una conversación alguien pregunta: «¿Por qué seguís mintiéndole a tu pareja?»",
    question: "¿Qué tipo de falacia contiene esta pregunta?",
    correctAnswer: FALLACY_NAMES.PREGUNTA_COMPLEJA,
    hint: "Responder implica aceptar algo que nunca fue demostrado.",
  },

  // ─── EL EQUÍVOCO ─────────────────────────────────────────────────────────
  {
    id: "equ_01",
    category: CATEGORIES.AMBIGUEDAD,
    fallacyName: FALLACY_NAMES.EQUIVOCO,
    scenario:
      "Sofía le pide una «pluma» a Marcos. Marcos responde que nunca traería una pluma de pájaro al colegio. Sofía aclara que hablaba de una pluma para escribir.",
    question: "¿Qué falacia de ambigüedad está presente en este malentendido?",
    correctAnswer: FALLACY_NAMES.EQUIVOCO,
    hint: "La misma palabra se usa con dos significados distintos dentro del mismo contexto.",
  },

  // ─── ANFIBOLOGÍA ─────────────────────────────────────────────────────────
  {
    id: "anf_01",
    category: CATEGORIES.AMBIGUEDAD,
    fallacyName: FALLACY_NAMES.ANFIBOLOGIA,
    scenario: "Alguien dice: «Vi a Juan caminando por el parque con unos binoculares.» No queda claro quién llevaba los binoculares.",
    question: "¿Qué falacia de ambigüedad produce la confusión en esta frase?",
    correctAnswer: FALLACY_NAMES.ANFIBOLOGIA,
    hint: "La ambigüedad surge de la estructura gramatical de la oración, no del significado de una palabra.",
  },
  {
    id: "anf_02",
    category: CATEGORIES.AMBIGUEDAD,
    fallacyName: FALLACY_NAMES.ANFIBOLOGIA,
    scenario:
      "En el grupo del curso aparece: «Vi a María saliendo del colegio con una amiga.» No queda claro si María estaba con la amiga o quien la vio.",
    question: "¿Qué tipo de falacia genera la ambigüedad de esta oración?",
    correctAnswer: FALLACY_NAMES.ANFIBOLOGIA,
    hint: "La confusión depende de cómo está construida la oración gramaticalmente.",
  },
  {
    id: "anf_03",
    category: CATEGORIES.AMBIGUEDAD,
    fallacyName: FALLACY_NAMES.ANFIBOLOGIA,
    scenario:
      "«Vi a mi vecino paseando al perro con mi hermano.» Alguien responde: «No sabía que tu hermano paseaba perros.»",
    question: "¿Qué falacia explica la confusión de este diálogo?",
    correctAnswer: FALLACY_NAMES.ANFIBOLOGIA,
    hint: "El complemento 'con mi hermano' puede referirse a más de una persona de la oración.",
  },
  {
    id: "anf_04",
    category: CATEGORIES.AMBIGUEDAD,
    fallacyName: FALLACY_NAMES.ANFIBOLOGIA,
    scenario: "«Pedro habló con el profesor enojado.» No queda claro si el que estaba enojado era Pedro o el profesor.",
    question: "¿Qué falacia de ambigüedad produce la confusión en esta frase?",
    correctAnswer: FALLACY_NAMES.ANFIBOLOGIA,
    hint: "La ambigüedad no viene de una palabra con dos significados, sino de la estructura de la oración.",
  },

  // ─── EL ÉNFASIS ──────────────────────────────────────────────────────────
  {
    id: "enf_01",
    category: CATEGORIES.AMBIGUEDAD,
    fallacyName: FALLACY_NAMES.ENFASIS,
    scenario:
      "Un estudiante dice: «Yo nunca dije que Juan copió la tarea.» Según qué palabra se enfatice, la frase puede significar cosas completamente distintas.",
    question: "¿Qué falacia de ambigüedad depende de cuál palabra se recalca al hablar?",
    correctAnswer: FALLACY_NAMES.ENFASIS,
    hint: "El significado cambia según qué parte de la frase se destaca con la voz o el énfasis.",
  },
  {
    id: "enf_02",
    category: CATEGORIES.AMBIGUEDAD,
    fallacyName: FALLACY_NAMES.ENFASIS,
    scenario:
      "La profesora dijo: «Los alumnos que estudien pueden aprobar el examen.» Tomás lo repite como: «La profe dijo que si estudiamos, aprobamos seguro.»",
    question: "¿Qué falacia comete Tomás al repetir lo que dijo la profesora?",
    correctAnswer: FALLACY_NAMES.ENFASIS,
    hint: "Se cambia el sentido original al destacar o ignorar ciertas palabras.",
  },

  // ─── LA DIVISIÓN ─────────────────────────────────────────────────────────
  {
    id: "div_01",
    category: CATEGORIES.AMBIGUEDAD,
    fallacyName: FALLACY_NAMES.DIVISION,
    scenario:
      "«Nuestra clase es la más destacada del colegio. Así que cada estudiante de esta clase debe ser uno de los mejores del colegio.»",
    question: "¿Qué falacia se comete al pasar de la cualidad del grupo a cada integrante?",
    correctAnswer: FALLACY_NAMES.DIVISION,
    hint: "Lo que es cierto del todo no necesariamente es cierto de cada parte.",
  },
];

module.exports = { FALLACIES, CATEGORIES, FALLACY_NAMES, ALL_WRONG_OPTIONS };
