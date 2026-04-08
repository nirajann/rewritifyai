export type HumanizeBenchmarkCase = {
  id: string;
  title: string;
  length: "short" | "medium" | "long";
  category:
    | "student-writing"
    | "formal-explanatory"
    | "ai-generic"
    | "awkward-writing";
  tone: "natural" | "formal";
  mode: "standard" | "school" | "report";
  inputText: string;
};

export const HUMANIZE_BENCHMARK_VERSION = "beta-2026-04-08";

export const HUMANIZE_BENCHMARK: HumanizeBenchmarkCase[] = [
  {
    id: "student_short_reflection",
    title: "Student Reflection",
    length: "short",
    category: "student-writing",
    tone: "natural",
    mode: "school",
    inputText:
      "I learned a lot from this group project because it showed me that communication is very important when different people are trying to finish the same task. At first, the process felt disorganized and a little stressful, but by the end we were able to divide the work more clearly and finish on time.",
  },
  {
    id: "formal_medium_policy",
    title: "Policy Explanation",
    length: "medium",
    category: "formal-explanatory",
    tone: "formal",
    mode: "report",
    inputText:
      "The policy was introduced to reduce preventable delays in internal approvals and to improve the consistency of project documentation across departments. In practice, the main change is that teams must submit a clearer project summary before requesting budget review. This additional step may appear minor, but it is intended to reduce back-and-forth communication later in the process and to make approval decisions easier to track.",
  },
  {
    id: "ai_medium_workflow",
    title: "Generic AI Workflow Copy",
    length: "medium",
    category: "ai-generic",
    tone: "natural",
    mode: "standard",
    inputText:
      "In today's world, technology plays a vital role in improving productivity across a wide range of industries. Furthermore, businesses can leverage advanced tools in order to streamline workflows, enhance communication, and optimize performance. It is important to note that these improvements can lead to more efficient outcomes and better long-term results.",
  },
  {
    id: "awkward_short_summary",
    title: "Awkward Summary",
    length: "short",
    category: "awkward-writing",
    tone: "natural",
    mode: "standard",
    inputText:
      "The cafe was nice and the service was fast, but the music was too loud which made it hard to talk normally. Because of this, the overall experience was good in some ways but not fully relaxing.",
  },
  {
    id: "student_medium_argument",
    title: "Student Argument Paragraph",
    length: "medium",
    category: "student-writing",
    tone: "natural",
    mode: "school",
    inputText:
      "School uniforms are often defended as a way to create equality, but that argument does not fully reflect what students actually experience. Wearing the same clothes may reduce some visible differences, yet it does not automatically remove social pressure or economic inequality. A better argument for uniforms is that they can simplify daily routines for families and reduce distractions in some school environments, although even that benefit depends on how the policy is applied.",
  },
  {
    id: "formal_long_overview",
    title: "Formal Program Overview",
    length: "long",
    category: "formal-explanatory",
    tone: "formal",
    mode: "report",
    inputText:
      "The training program was designed to support newly promoted team leads during their first three months in role. Rather than focusing only on theory, the program combines short workshops, peer discussion, and scenario-based exercises that reflect common management challenges. Participants are expected to practice difficult conversations, review examples of unclear delegation, and document how they would respond in realistic situations. Early feedback suggests that the practical format is more useful than longer presentation-style sessions because it allows participants to test ideas and receive immediate input from others. At the same time, the pilot also showed that time pressure remains a problem for some teams, particularly when workshops are scheduled during busy reporting periods. For that reason, the next version of the program will likely keep the same content while adjusting delivery times and shortening a few exercises.",
  },
  {
    id: "ai_long_generic_article",
    title: "Generic AI Article Style",
    length: "long",
    category: "ai-generic",
    tone: "natural",
    mode: "standard",
    inputText:
      "Artificial intelligence has become an increasingly significant part of modern life, and it continues to influence how people work, learn, and communicate. Moreover, many organizations are exploring innovative solutions that can improve efficiency, reduce manual effort, and support better decision-making. It is important to note that the adoption of these systems can offer a wide range of advantages, including faster analysis, stronger automation, and improved scalability. At the same time, there are also important considerations related to ethics, transparency, and reliability. In many cases, successful implementation depends on thoughtful planning, ongoing oversight, and a clear understanding of the limitations of the technology. Overall, artificial intelligence can create meaningful opportunities, but the outcomes often depend on how responsibly it is applied in real-world settings.",
  },
  {
    id: "awkward_medium_process",
    title: "Awkward Process Description",
    length: "medium",
    category: "awkward-writing",
    tone: "natural",
    mode: "standard",
    inputText:
      "The onboarding guide explains the steps in a useful way, but some sections are arranged in a confusing order and that makes the first read harder than it needs to be. New hires usually understand the general process after reading it once, although they still have to go back and check details because the examples are not placed where people would expect them.",
  },
];
