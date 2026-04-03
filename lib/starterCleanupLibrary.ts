/**
 * Sentence-starter cleanup library.
 *
 * Purpose:
 * - fixes awkward rewrite leftovers that often make text sound AI-generated
 * - keeps this data separate so you can keep adding more patterns later
 *
 * Design rule:
 * - keep replacements simple and natural
 * - avoid overly clever rewrites
 * - focus on weak sentence openings and broken carry-over phrases
 */

export const STARTER_CLEANUP_PATTERNS: Array<[RegExp, string]> = [
  // Weak "Which..." starters
  [/\bWhich improves\b/gi, "This improves"],
  [/\bWhich makes\b/gi, "This makes"],
  [/\bWhich helps\b/gi, "This helps"],
  [/\bWhich keeps\b/gi, "This keeps"],
  [/\bWhich allows\b/gi, "This allows"],
  [/\bWhich means\b/gi, "This means"],
  [/\bWhich supports\b/gi, "This supports"],
  [/\bWhich reduces\b/gi, "This reduces"],
  [/\bWhich increases\b/gi, "This increases"],
  [/\bWhich gives\b/gi, "This gives"],
  [/\bWhich creates\b/gi, "This creates"],
  [/\bWhich makes it easier\b/gi, "This makes it easier"],
  [/\bWhich is why\b/gi, "This is why"],

  // Weak "Because..." starters
  [/\bBecause of this\b/gi, "As a result"],
  [/\bBecause of that\b/gi, "For that reason"],
  [/\bBecause of its\b/gi, "Thanks to its"],
  [/\bBecause of their\b/gi, "Thanks to their"],
  [/\bBecause of the\b/gi, "Due to the"],
  [/\bBecause this\b/gi, "Since this"],
  [/\bBecause it\b/gi, "Since it"],

  // Weak "One..." starters
  [/\bOne common use of\b/gi, "A common use of"],
  [/\bOne major use of\b/gi, "A major use of"],
  [/\bOne of the main reasons\b/gi, "A main reason"],
  [/\bOne of the key reasons\b/gi, "A key reason"],
  [/\bOne important reason\b/gi, "An important reason"],

  // Lowercase/awkward "Where..." carry-overs
  [/\bWhere developers create\b/gi, "where developers create"],
  [/\bWhere users can\b/gi, "where users can"],
  [/\bWhere people can\b/gi, "where people can"],
  [/\bWhere students learn\b/gi, "where students learn"],
  [/\bWhere organizations use\b/gi, "where organizations use"],

  // Broken "And..." starters
  [/\bAnd many other\b/gi, "as well as many other"],
  [/\bAnd strong\b/gi, "along with strong"],
  [/\bAnd helping\b/gi, "while helping"],
  [/\bAnd making sure\b/gi, "while making sure"],
  [/\bAnd support\b/gi, "along with support"],
  [/\bAnd this\b/gi, "This"],
  [/\bAnd these\b/gi, "These"],
  [/\bAnd it\b/gi, "It"],

  // Weak "Although / While / Especially" starters
  [/\bAlthough react\b/gi, "React"],
  [/\bAlthough Java\b/gi, "Java"],
  [/\bAlthough nursing\b/gi, "Nursing"],
  [/\bWhile react\b/gi, "React"],
  [/\bWhile Java\b/gi, "Java"],
  [/\bEspecially for\b/gi, "Particularly for"],
  [/\bEspecially in\b/gi, "Particularly in"],

  // Bad split leftovers
  [/\bThis is possible because\.\s+/gi, "This is possible because "],
  [/\bIt is also widely used in\.\s+/gi, "It is also widely used in "],
  [/\bIt was designed to\.\s+/gi, "It was designed to "],
  [/\bIt is known for\.\s+/gi, "It is known for "],
  [/\bThis helps to\.\s+/gi, "This helps to "],
  [/\bThis allows users to\.\s+/gi, "This allows users to "],

  // Subject + bad period splits
  [/\bReact is a popular\.\s+/gi, "React is a popular "],
  [/\bJava is a popular\.\s+/gi, "Java is a popular "],
  [/\bNursing is a respected\.\s+/gi, "Nursing is a respected "],
  [/\bPython is a widely used\.\s+/gi, "Python is a widely used "],
  [/\bThis feature is important\.\s+/gi, "This feature is important "],

  // Awkward factual starters
  [/\bJava because it teaches\b/gi, "Java teaches"],
  [/\bReact because it helps\b/gi, "React helps"],
  [/\bNursing because it involves\b/gi, "Nursing involves"],
  [/\bThis feature because it\b/gi, "This feature"],
  [/\bThis system because it\b/gi, "This system"],

  // Mild cleanup for repetitive formal carry-overs
  [/\bAs a result of this\b/gi, "As a result"],
  [/\bDue to this\b/gi, "Because of this"],
  [/\bFor this reason\b/gi, "Because of this"],
  [/\bIn this way\b/gi, "This way"],
  [/\bAt the same time\b/gi, "At the same time"],

  // Sentence-start polish
  [/\bThis improves the\b/gi, "This improves the"],
  [/\bThis makes the\b/gi, "This makes the"],
  [/\bThis helps the\b/gi, "This helps the"],
  [/\bThis allows the\b/gi, "This allows the"],
  [/\bThis is because\.\s+/gi, "This is because "],
[/\bThat is because\.\s+/gi, "That is because "],
[/\bAs a result of this\.\s+/gi, "As a result of this "],
[/\bFor this reason\.\s+/gi, "For this reason "],
[/\bWhich is important because\b/gi, "This is important because"],
[/\bWhich is useful because\b/gi, "This is useful because"],
[/\bWhich is why it is\b/gi, "This is why it is"],
[/\bWhich is why they are\b/gi, "This is why they are"],
[/\bBecause it can\b/gi, "Since it can"],
[/\bBecause they can\b/gi, "Since they can"],
[/\bBecause this allows\b/gi, "Since this allows"],
[/\bOne reason this matters\b/gi, "A reason this matters"],
[/\bAnd this helps\b/gi, "This helps"],
[/\bAnd this makes\b/gi, "This makes"],
[/\bAnd this improves\b/gi, "This improves"],
[/\bAnd this allows\b/gi, "This allows"],
[/\bWhere it is used\b/gi, "where it is used"],
[/\bWhere it can be used\b/gi, "where it can be used"],
[/\bWhere students can learn\b/gi, "where students can learn"],
[/\bWhere professionals use\b/gi, "where professionals use"],
];