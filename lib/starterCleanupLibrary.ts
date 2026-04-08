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
  [/\bAnd they\b/gi, "They"],
  [/\bAnd this can\b/gi, "This can"],
  [/\bAnd this also\b/gi, "This also"],
  [/\bAnd that\b/gi, "That"],
  [/\bAnd those\b/gi, "Those"],
  [/\bAnd people can\b/gi, "People can"],
  [/\bAnd users can\b/gi, "Users can"],
  [/\bAnd developers can\b/gi, "Developers can"],

  // Weak "Although / While / Especially" starters
  [/\bAlthough react\b/gi, "React"],
  [/\bAlthough Java\b/gi, "Java"],
  [/\bAlthough nursing\b/gi, "Nursing"],
  [/\bWhile react\b/gi, "React"],
  [/\bWhile Java\b/gi, "Java"],
  [/\bWhile this\b/gi, "This"],
  [/\bWhile these\b/gi, "These"],
  [/\bWhile it\b/gi, "It"],
  [/\bAlthough this\b/gi, "This"],
  [/\bAlthough these\b/gi, "These"],
  [/\bAlthough it\b/gi, "It"],
  [/\bEspecially for\b/gi, "Particularly for"],
  [/\bEspecially in\b/gi, "Particularly in"],
  [/\bParticularly when\b/gi, "This is especially true when"],

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
  [/\bIn addition to this\b/gi, "In addition"],
  [/\bOn top of this\b/gi, "On top of that"],
  [/\bAs such\b/gi, "So"],
  [/\bIn turn\b/gi, "This in turn"],

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
[/\bThis field is key\b/gi, "This field matters"],
[/\bSince it explains\b/gi, "because it explains"],
[/\bIncluding education, healthcare, business, and counseling\b/gi, "It is used in education, healthcare, business, and counseling"],
[/\bOne of the main goals of\b/gi, "One goal of"],
[/\bis considered a valuable and growing field in modern society\b/gi, "is seen as a useful and growing field in modern society"],

  // More weak "Which..." starters that show up in AI-edited output
  [/\bWhich can\b/gi, "This can"],
  [/\bWhich often\b/gi, "This often"],
  [/\bWhich also\b/gi, "This also"],
  [/\bWhich still\b/gi, "This still"],
  [/\bWhich gives users\b/gi, "This gives users"],
  [/\bWhich gives developers\b/gi, "This gives developers"],
  [/\bWhich lets\b/gi, "This lets"],
  [/\bWhich leads to\b/gi, "This leads to"],
  [/\bWhich results in\b/gi, "This results in"],
  [/\bWhich can help\b/gi, "This can help"],
  [/\bWhich can make\b/gi, "This can make"],
  [/\bWhich can improve\b/gi, "This can improve"],
  [/\bWhich can reduce\b/gi, "This can reduce"],

  // More weak "Because..." and "Since..." openings
  [/\bBecause this helps\b/gi, "This helps"],
  [/\bBecause this makes\b/gi, "This makes"],
  [/\bBecause this improves\b/gi, "This improves"],
  [/\bBecause they\b/gi, "Since they"],
  [/\bBecause users\b/gi, "Since users"],
  [/\bBecause developers\b/gi, "Since developers"],
  [/\bSince this\b/gi, "Because this"],
  [/\bSince these\b/gi, "Because these"],

  // More carry-over "Where..." fragments
  [/\bWhere teams can\b/gi, "where teams can"],
  [/\bWhere businesses can\b/gi, "where businesses can"],
  [/\bWhere researchers can\b/gi, "where researchers can"],
  [/\bWhere teachers can\b/gi, "where teachers can"],
  [/\bWhere nurses can\b/gi, "where nurses can"],

  // Awkward "This is because..." leftovers
  [/\bThis is because it helps\b/gi, "This helps because it"],
  [/\bThis is because it makes\b/gi, "This makes it possible to"],
  [/\bThis is because it allows\b/gi, "This allows"],
  [/\bThis is because they can\b/gi, "They can do this because"],
  [/\bThat is because it\b/gi, "That happens because it"],

  // Sentence openings that sound essay-like or machine-clean
  [/\bIt is important to note that\b/gi, ""],
  [/\bIt should be noted that\b/gi, ""],
  [/\bIt is worth noting that\b/gi, ""],
  [/\bIt is worth mentioning that\b/gi, ""],
  [/\bIn today's world\b/gi, "Today"],
  [/\bIn the modern world\b/gi, "Today"],
  [/\bOverall,?\b/gi, "Overall,"],
  [/\bFurthermore,?\b/gi, "Also,"],
  [/\bMoreover,?\b/gi, "Also,"],
  [/\bAdditionally,?\b/gi, "Also,"],

  // Broken lower-case / abrupt opener repair
  [/\bThis means a\b/gi, "This means"],
  [/\bThis is another reason\b/gi, "Another reason is"],
  [/\bThis is one reason\b/gi, "One reason is"],
  [/\bThat is why\b/gi, "That is why"],
  [/\bThis is why\b/gi, "This is why"],
];

