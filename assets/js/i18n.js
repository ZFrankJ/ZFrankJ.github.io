const LANGUAGE_KEY = "fz-language";
const LEGACY_ARTICLE_LANGUAGE_KEY = "fz-article-language";

const entries = [
  { aliases: ["Fujia Zhang", "Fujia Zhang (张孚嘉)"], en: "Fujia Zhang · 张孚嘉", zh: "张孚嘉 · Fujia Zhang" },
  { aliases: ["© 2026 Fujia Zhang. All rights reserved."], en: "© 2026 Fujia Zhang · 张孚嘉. All rights reserved.", zh: "© 2026 张孚嘉 · Fujia Zhang。保留所有权利。" },

  ["Home", "首页"],
  ["Science", "科学"],
  ["Finance", "金融"],
  ["Others", "其他"],
  ["Profile", "个人简介"],
  ["Name", "姓名"],
  ["Email", "邮箱"],
  ["Current focus", "当前关注"],
  ["Highlights", "精选"],
  ["Read:", "阅读："],
  ["Source:", "来源："],
  ["Origin", "起点"],
  ["← Back to home", "← 返回首页"],
  ["← Back to Others", "← 返回“其他”"],
  ["← Back to Notes", "← 返回随笔集"],
  ["Self-Cultivation Notes", "自我修行随笔"],
  ["Self-Cultivation", "自我修行"],

  ["Settings", "设置"],
  ["Language", "语言"],
  ["Theme", "主题"],
  ["FX", "FX"],
  ["Display controls", "显示设置"],
  ["Open settings", "打开设置"],
  ["Close settings", "关闭设置"],
  ["Switch language", "切换语言"],
  ["Switch theme", "切换主题"],
  ["System", "跟随系统"],
  ["Light", "浅色"],
  ["Dark", "深色"],
  ["System theme", "跟随系统主题"],
  ["Light theme", "浅色主题"],
  ["Dark theme", "深色主题"],
  ["Enable liquid lens", "开启液态透镜特效"],
  ["Disable liquid lens", "关闭液态透镜特效"],
  ["FX unavailable in Safari", "Safari 中无法使用 FX"],
  ["FX unavailable on touch devices", "触控设备上无法使用 FX"],
  ["Liquid Lens", "液态透镜"],
  ["Liquid FX is on by default to make the page feel alive. Tap the FX setting any time to return to normal. Safari and touch devices stay on the normal display because they do not support this FX reliably.", "液态 FX 默认开启，让页面更有生命力。你可以随时点击 FX 设置恢复普通显示。由于该效果在 Safari 和触控设备上不够可靠，这些设备会保持普通显示。"],
  ["Keep FX", "保留 FX"],
  ["Turn off FX", "关闭 FX"],
  ["FX Support Note", "FX 支持说明"],
  ["Understood", "明白了"],
  ["Close", "关闭"],
  ["Liquid FX is disabled in Safari because WebKit does not support this effect reliably. Touch devices also stay on the normal display.", "由于 WebKit 无法可靠支持此效果，Safari 中已关闭液态 FX。触控设备也会保持普通显示。"],
  ["Liquid FX is disabled on touch devices. Safari also stays on the normal display because the effect is not reliable there.", "触控设备上已关闭液态 FX。由于该效果在 Safari 中不够可靠，Safari 也会保持普通显示。"],
  ["Loading image", "正在加载图片"],
  ["Image unavailable", "图片无法显示"],
  ["Previous image", "上一张图片"],
  ["Next image", "下一张图片"],

  { aliases: ["Fujia Zhang | Personal Website"], en: "Fujia Zhang · 张孚嘉 | Personal Website", zh: "张孚嘉 · Fujia Zhang | 个人网站" },
  ["Science · Finance · Everything in between", "科学 · 金融 · 及两者之间的一切"],
  ["High school student exploring general intelligence, quantitative trading, vibe coding, and Buddhism.", "一名探索通用智能、量化交易、随兴编程与佛学的高中生。"],
  ["General Intelligence, Quantitative Trading, Vibe Coding and Buddhism", "通用智能、量化交易、随兴编程与佛学"],
  ["Science · Neo Neuron: a new recurrent cell", "科学 · Neo 神经元：一种新的循环单元"],
  ["Tested Neo against an aligned LSTM; the final WikiText-103 study found no parameter-efficiency advantage.", "将 Neo 与对齐后的 LSTM 进行测试；最终的 WikiText-103 研究未发现参数效率优势。"],
  ["Tech blog", "技术博客"],
  ["Paper (PDF)", "论文（PDF）"],
  ["Repository", "代码仓库"],
  ["Finance · From scripts to a system", "金融 · 从脚本到系统"],
  ["How a quant project changed the way I build with AI.", "一个量化项目如何改变了我与 AI 协作开发的方式。"],
  ["Open journal ↗", "打开日志 ↗"],
  ["Others · Particle interaction", "其他 · 粒子交互"],
  ["3D particle interaction using hand gestures.", "基于手势的三维粒子交互。"],
  ["Profile · Contact", "个人简介 · 联系方式"],
  ["Reach out for research chats, mentorship, or to share papers.", "欢迎联系我，探讨研究、寻求指导，或分享论文。"],

  { aliases: ["Fujia Zhang | Science"], en: "Fujia Zhang · 张孚嘉 | Science", zh: "张孚嘉 · Fujia Zhang | 科学" },
  ["General intelligence, language and vision experiments, and AI projects that build intuition.", "通用智能、语言与视觉实验，以及用于培养直觉的 AI 项目。"],
  ["Neo Neuron: a new recurrent cell", "Neo 神经元：一种新的循环单元"],
  ["Designed a recurrent cell for persistent-state language modeling and tested it against an aligned RMSNorm-LSTM across three WikiText-103 scales. After backend auditing and baseline alignment, the final study found no parameter-efficiency advantage for Neo under the tested setup.", "设计了一种用于持久状态语言建模的循环单元，并在 WikiText-103 的三个规模上与对齐后的 RMSNorm-LSTM 进行对比测试。经后端审计和基线对齐后，最终研究表明，在所测试的设置下，Neo 并不具备参数效率优势。"],
  ["Transformer Train and confirm failure in early cortical models", "Transformer 训练与早期皮层模型失败的确认"],
  ["Successfully train a Transformer as a solid baseline, but failed to scaling up early cortical models.", "成功训练 Transformer 作为可靠基线，但早期皮层模型未能成功扩展规模。"],
  ["Early cortical models", "早期皮层模型"],
  ["Build cortical-style model with new activation function&architecture and succeed on MNIST.", "构建采用新激活函数与架构的皮层式模型，并在 MNIST 上取得成功。"],
  ["Early cortical model figure 1", "早期皮层模型图 1"],
  ["Early cortical model figure 2", "早期皮层模型图 2"],
  ["Virtual Try-on", "虚拟试衣"],
  ["Build prototype by utilizing AI workflows in coze to generate virtual try-on experiences (Done in 2025 GIR camp).", "利用 Coze 中的 AI 工作流构建虚拟试衣体验原型（完成于 2025 GIR 夏令营）。"],
  ["Project page", "项目页面"],
  ["Virtual try-on sample 1", "虚拟试衣示例 1"],
  ["Virtual try-on sample 2", "虚拟试衣示例 2"],
  ["Virtual try-on sample 3", "虚拟试衣示例 3"],
  ["Humanity's Last Exam", "人类最后的考试（Humanity's Last Exam）"],
  ["Attempts to frame hard questions for frontier AI models, but failed to be included in dataset.", "尝试为前沿 AI 模型设计高难度问题，但最终未被数据集收录。"],
  ["Humanity's Last Exam image 1", "“人类最后的考试”图片 1"],
  ["Humanity's Last Exam image 2", "“人类最后的考试”图片 2"],
  ["Early paper writing", "早期论文写作"],
  ["Forming ideas including MoE, Large Concept Model, but lack formal experiments to support.", "构思了包括 MoE、大型概念模型在内的想法，但缺乏正式实验支持。"],
  ["Preview draft (PDF)", "预览草稿（PDF）"],
  ["Prompt Engineering", "提示词工程"],
  ["Try using prompts to let LLMs to think in CoT.", "尝试通过提示词引导大型语言模型（LLM）进行思维链（CoT）推理。"],
  ["My YouTube channel", "我的 YouTube 频道"],
  ["Reading Life 3.0", "阅读《生命 3.0》"],
  ["Reading", "阅读"],
  ["Life 3.0", "《生命 3.0》"],
  ["First bringing me the big, fascinating future of the world with AI.", "这本书第一次向我展现了人工智能将如何塑造一个宏大而迷人的未来世界。"],

  { aliases: ["Fujia Zhang | Finance"], en: "Fujia Zhang · 张孚嘉 | Finance", zh: "张孚嘉 · Fujia Zhang | 金融" },
  ["Use quantified analysis to assess current market conditions and apply quantitative trading method into real market.", "运用量化分析评估当前市场状况，并将量化交易方法应用于真实市场。"],
  ["From scripts to a system: building a quant project with AI", "从脚本到系统：与 AI 共建量化项目"],
  ["A first-person engineering history of how a collection of quantitative scripts grew into a governed private product, with Git, automation, interface design and exact-code evidence shaping the collaboration.", "以第一人称回顾一组量化脚本如何成长为一套治理完善的私有产品，以及 Git、自动化、界面设计和精确代码证据如何塑造这段协作。"],
  ["Journal:", "日志："],
  ["Read the full engineering trajectory ↗", "阅读完整工程历程 ↗"],
  ["Private GUI interface for family members", "面向家人的私有图形界面"],
  ["Build local financial dashboard for family members to check for signals, history and run codes conveniently.", "构建本地金融仪表盘，让家人能够便捷地查看信号与历史记录，并运行程序。"],
  ["Looking back:", "回看："],
  ["This January dashboard is now out of date. The core functions remain, but the current interface is much richer.", "这个一月版仪表盘如今已经过时。核心功能仍然保留，但目前的界面丰富得多。"],
  ["Finance dashboard preview showing the main interface", "金融仪表盘主界面预览"],
  ["Finance dashboard preview showing a historical view", "金融仪表盘历史记录界面预览"],
  ["Finance dashboard preview showing an analysis view", "金融仪表盘分析界面预览"],
  ["My latest quantitative trading achievement", "最新量化交易成果"],
  ["Combining two different trading methods to benefit from both bullish and bearish.", "结合两种不同的交易方法，力求同时受益于多头与空头行情。"],
  ["This was an immature early test and did not account for trading fees or slippage.", "这是一次尚不成熟的早期测试，未计入交易手续费或滑点。"],
  ["Early Test Leak", "早期测试截图"],
  ["My own investing outlook --after reading High returns from low risk", "读完《低风险高回报》后的个人投资展望"],
  ["My own investing outlook --after reading", "读完以下书籍后的个人投资展望："],
  ["High returns from low risk", "《低风险高回报》"],
  ["Building a theory that fits to predict all financial products in revenue and risk.", "构建一套理论，用于预测各类金融产品的收益与风险。"],
  ["My WeChat article", "我的微信公众号文章"],
  ["Early quantitative trading&Compound interest", "早期量化交易与复利"],
  ["Based on ETFs to do quantitative tradings and realize the benefit of compound interest in long-term.", "以 ETF 为基础进行量化交易，并认识到长期复利的价值。"],
  ["Normal distribution and other analysis after reading Thinking, fast and slow", "读完《思考，快与慢》后的正态分布及其他分析"],
  ["Normal distribution and other analysis after reading", "读完以下书籍后的正态分布及其他分析："],
  ["Thinking, fast and slow", "《思考，快与慢》"],
  ["Predict the downturn of A stock market based on normal distribution and objective assessment from the book.", "基于正态分布和书中的客观评估，预测 A 股市场的下行走势。"],
  ["Opportunity in bearish --US bond", "熊市中的机会——美国国债"],
  ["Predict the soar in US bond price and give analysis.", "预测美国国债价格上涨并给出分析。"],
  ["Prophet Prediction --SP500", "Prophet 预测——标普 500"],
  ["Use Transformer model to predict the future of SP500 index and hint of future bearish.", "使用 Transformer 模型预测标普 500 指数的未来走势，并提示未来可能进入熊市。"],
  ["Chat with ChatGPT", "与 ChatGPT 对话"],
  ["AI introduce quantified analysis to me and start my journey in quantitative trading.", "AI 向我介绍了量化分析，由此开启了我的量化交易之旅。"],

  { aliases: ["Fujia Zhang | Profile"], en: "Fujia Zhang · 张孚嘉 | Profile", zh: "张孚嘉 · Fujia Zhang | 个人简介" },
  ["How to reach me and what I’m most excited to talk about right now.", "我的联系方式，以及此刻最期待与你交流的话题。"],
  ["Fujia Zhang portrait", "张孚嘉 · Fujia Zhang 的肖像"],
  ["Institution:", "学校："],
  ["Shanghai GuangHua Cambridge International School", "上海光华剑桥国际学校"],
  ["Role:", "身份："],
  ["High School Student Researcher & Aspiring AI Scientist", "高中生研究者，立志成为人工智能科学家"],
  ["Topics", "关注方向"],
  ["Aphorism", "格言"],
  ["Quick links", "快速链接"],
  ["General intelligence experiments.", "通用智能实验。"],
  ["Quantitative Trading.", "量化交易。"],
  ["Vibe coding and self-cultivation.", "随兴编程与自我修行。"],
  ["Direct link to important events.", "直达重要事件。"],
  ["— General intelligence experiments.", "— 通用智能实验。"],
  ["— Quantitative Trading.", "— 量化交易。"],
  ["— Vibe coding and self-cultivation.", "— 随兴编程与自我修行。"],
  ["— Direct link to important events.", "— 直达重要事件。"],

  { aliases: ["Fujia Zhang | Others"], en: "Fujia Zhang · 张孚嘉 | Others", zh: "张孚嘉 · Fujia Zhang | 其他" },
  ["Vibe coding and self-cultivation that don’t fit neatly into science or finance.", "那些无法简单归入科学或金融的随兴编程与自我修行。"],
  ["Vibe coding", "随兴编程"],
  ["Playful prototypes, hand-driven interfaces, and quick games.", "趣味原型、手势交互，以及即开即玩的小游戏。"],
  ["Solar System", "太阳系"],
  ["Solar system displaying and simulating.", "太阳系的展示与模拟。"],
  ["A public repo for shaping repeatable Codex workflows and agent operating patterns.", "一个用于构建可复用 Codex 工作流与智能体协作模式的公开仓库。"],
  ["3D FPS game", "3D 第一人称射击游戏"],
  ["Operation Clearwater.", "Operation Clearwater。"],
  ["Play online ↗", "在线游玩 ↗"],
  ["Particle interaction", "粒子交互"],
  ["Sight Trainer", "Sight Trainer"],
  ["Fast visual recognition training with quick-response rounds.", "通过快速反应回合训练视觉识别能力。"],
  ["Airplane Fight", "Airplane Fight"],
  ["3D airplane combat gameplay.", "3D 飞机空战游戏。"],
  ["Sport exercise, aesthetic accomplishment and internal journey of myself.", "我的运动锻炼、审美修养与向内探索之旅。"],
  ["Karate", "空手道"],
  ["Persisting for over 6 years and achieve black belt.", "坚持练习六年有余，并取得黑带。"],
  ["Traditional Chinese Art", "中国传统艺术"],
  ["Persisting for over 6 years and achieve level 10 in Calligraphy and level 3 in Chinese Painting.", "坚持学习六年有余，取得书法十级与国画三级。"],
  ["The Duke of Edinburgh's International Award", "爱丁堡公爵国际奖"],
  ["Through 6 months'time, discover my potential challenge myself, and achieve Bronze medal.", "历经六个月的挑战，发掘潜能、突破自我，并获得铜奖。"],
  ["Buddhism", "佛学"],
  ["The Buddha is one who awakens from true reality and embodies that awakening in lived form.", "佛陀，是从真实中觉醒，并将这份觉悟践行于生命中的人。"],
  ["Buddhism should be treated as a method of pursuing wisdom, happiness, wellness and longevity rather than just a religion and superstition.", "佛学应被视为一种追求智慧、幸福、身心健康与长寿的方法，而不只是宗教或迷信。"],
  ["Literature", "文学"],
  ["Some personal writing attempts.", "一些个人文学创作尝试。"],

  { aliases: ["Fujia Zhang | Literature"], en: "Fujia Zhang · 张孚嘉 | Literature", zh: "张孚嘉 · Fujia Zhang | 文学" },
  ["Personal writing attempts by Fujia Zhang.", "张孚嘉 · Fujia Zhang 的个人文学创作尝试。"],
  ["Jul 22, 2026", "2026年7月22日"],
  ["One Hundred Years of Echoes · Version 1", "百年回声 · 第一版"],
  ["One Hundred Years of Echoes · Version 2", "百年回声 · 第二版"],
  ["Humanity soon drowned in its own echoes and began to mistake them for a new voice.", "人类很快便淹没在自己的回声之中，并渐渐把它当作一种新的声音。"],
  ["A century later, an old man heard his father within humanity’s countless echoes.", "一百年后，一个老人在人类留下的无数回声里，听见了父亲。"],
  ["Read story →", "阅读小说 →"],
  ["One Hundred Years of Echoes", "百年回声"],
  ["Version 1", "第一版"],
  ["Version 2", "第二版"],
  ["← Back to Literature", "← 返回文学"],
  { aliases: ["百年回声 · 第一版 | Fujia Zhang"], en: "One Hundred Years of Echoes · Version 1 | Fujia Zhang · 张孚嘉", zh: "百年回声 · 第一版 | 张孚嘉 · Fujia Zhang" },
  { aliases: ["百年回声 · 第二版 | Fujia Zhang"], en: "One Hundred Years of Echoes · Version 2 | Fujia Zhang · 张孚嘉", zh: "百年回声 · 第二版 | 张孚嘉 · Fujia Zhang" },
  ["One Hundred Years of Echoes, Version 1 — a personal writing attempt about humanity hearing itself in artificial intelligence.", "《百年回声》第一版——关于人类在人工智能中听见自身回声的一次个人创作尝试。"],
  ["One Hundred Years of Echoes, Version 2 — a personal writing attempt about memory, artificial intelligence, and a father’s voice across time.", "《百年回声》第二版——关于记忆、人工智能与跨越时间的父亲之声的一次个人创作尝试。"],
  ["Journal entry — Wednesday, July 22, 2026", "随笔记录 — 2026年7月22日，星期三"],
  ["A child and an older man facing artificial intelligence across a century of human echoes", "一个孩子与一位老人隔着百年的人类回声面对人工智能"],
  ["Illustration for One Hundred Years of Echoes · Version 2", "《百年回声》第二版插图"],

  { aliases: ["Fujia Zhang | Self-Cultivation Gallery"], en: "Fujia Zhang · 张孚嘉 | Self-Cultivation Gallery", zh: "张孚嘉 · Fujia Zhang | 自我修行影集" },
  ["Self-Cultivation Gallery", "自我修行影集"],
  ["Karate, calligraphy, and Duke of Edinburgh moments collected in one place.", "汇集空手道、书法与爱丁堡公爵国际奖旅程中的珍贵瞬间。"],
  ["Calligraphy", "书法"],
  ["Duke of Edinburgh", "爱丁堡公爵国际奖"],
  ["Karate image 1", "空手道图片 1"],
  ["Karate image 2", "空手道图片 2"],
  ["Karate image 3", "空手道图片 3"],
  ["Calligraphy image 1", "书法图片 1"],
  ["Calligraphy image 2", "书法图片 2"],
  ["Calligraphy image 3", "书法图片 3"],
  ["Calligraphy image 4", "书法图片 4"],
  ["Duke of Edinburgh image 1", "爱丁堡公爵国际奖图片 1"],
  ["Duke of Edinburgh image 2", "爱丁堡公爵国际奖图片 2"],
  ["Duke of Edinburgh image 3", "爱丁堡公爵国际奖图片 3"],

  { aliases: ["Fujia Zhang | Self-Cultivation Notes"], en: "Fujia Zhang · 张孚嘉 | Self-Cultivation Notes", zh: "张孚嘉 · Fujia Zhang | 自我修行随笔" },
  ["Journal notes by Fujia Zhang on consciousness, identity, attachment, and self-cultivation.", "张孚嘉 · Fujia Zhang 关于意识、身份、执着与自我修行的随笔。"],
  ["Reflections on consciousness, identity, attachment, and the continuing practice of looking inward.", "关于意识、身份、执着，以及持续向内观照的思考。"],
  ["Aug 2, 2026", "2026年8月2日"],
  ["May 28, 2026", "2026年5月28日"],
  ["Aug 13, 2025", "2025年8月13日"],
  ["Read note →", "阅读随笔 →"],
  ["向内求：一场迟来的自我修行", "向内求：一场迟来的自我修行"],
  ["Seeking Within: A Belated Journey of Self-Cultivation", "向内求：一场迟来的自我修行"],
  ["向外求，让我看见世界；向内求，让我看见自己。", "向外求，让我看见世界；向内求，让我看见自己。"],
  ["Seeking outward allowed me to see the world; seeking inward allowed me to see myself.", "向外求，让我看见世界；向内求，让我看见自己。"],
  ["关于我相的进一步思考以及指导意义", "关于我相的进一步思考以及指导意义"],
  ["Further Reflections on the Notion of Self", "关于我相的进一步思考以及指导意义"],
  ["认识到“我”是被形成的，不是为了消解自己，而是为了不再被旧的自己完全支配。", "认识到“我”是被形成的，不是为了消解自己，而是为了不再被旧的自己完全支配。"],
  ["Recognizing that the self was formed is a way of no longer being completely ruled by who we once were.", "认识到“我”是被形成的，不是为了消解自己，而是为了不再被旧的自己完全支配。"],
  ["说破四相", "说破四相"],
  ["Seeing Through the Four Marks", "说破四相"],
  ["破除四相，离执去妄，以“空明之心”如实观照万物。", "破除四相，离执去妄，以“空明之心”如实观照万物。"],
  ["See through the Four Marks and contemplate all things with an empty and lucid mind.", "破除四相，离执去妄，以“空明之心”如实观照万物。"],

  ["Seeking Within", "向内求"],
  ["— Reflections on Looking Back at My Journey of Awakening", "—— 再度回首开悟之旅有感"],
  { aliases: ["向内求：一场迟来的自我修行 | Fujia Zhang", "Seeking Within: A Belated Journey of Self-Cultivation | Fujia Zhang"], en: "Seeking Within: A Belated Journey of Self-Cultivation | Fujia Zhang · 张孚嘉", zh: "向内求：一场迟来的自我修行 | 张孚嘉 · Fujia Zhang" },
  ["A reflection on awakening, responsibility, and the deliberate allocation of finite attention.", "向内求：一场迟来的自我修行——再度回首开悟之旅有感。"],
  ["Journal entry — Sunday, August 2, 2026", "随笔记录 — 2026年8月2日，星期日"],
  ["Further Reflections on the Notion of Self — and Its Practical Implications", "关于我相的进一步思考以及指导意义"],
  ["— and Its Practical Implications", "—— 及其指导意义"],
  ["Notion of Self", "我相"],
  { aliases: ["关于我相的进一步思考以及指导意义 | Fujia Zhang"], en: "Further Reflections on the Notion of Self | Fujia Zhang · 张孚嘉", zh: "关于我相的进一步思考以及指导意义 | 张孚嘉 · Fujia Zhang" },
  ["Further reflections on the notion of self and its practical implications.", "关于我相的进一步思考以及指导意义。"],
  ["Journal entry — Thursday, May 28, 2026", "随笔记录 — 2026年5月28日，星期四"],
  ["Four Marks", "四相"],
  ["— An Excerpt from Another Writer", "—— 摘录他人语句"],
  ["(摘录他人语句)", "（摘录他人语句）"],
  { aliases: ["说破四相 | Fujia Zhang"], en: "Seeing Through the Four Marks | Fujia Zhang · 张孚嘉", zh: "说破四相 | 张孚嘉 · Fujia Zhang" },
  ["Seeing through the Four Marks: letting go of attachment and illusion.", "说破四相：破除四相，离执去妄。"],
  ["Journal entry — Wednesday, August 13, 2025", "随笔记录 — 2025年8月13日，星期三"]
];

const lookup = new Map();

entries.forEach((rawEntry) => {
  const entry = Array.isArray(rawEntry)
    ? { en: rawEntry[0], zh: rawEntry[1], aliases: [] }
    : { ...rawEntry, aliases: rawEntry.aliases || [] };

  [entry.en, entry.zh, ...entry.aliases].forEach((value) => {
    lookup.set(value, entry);
  });
});

const textEntries = new WeakMap();
const attributeEntries = new WeakMap();
let currentLanguage = "en";

function normalizeLanguage(language) {
  return language === "zh" || language === "zh-CN" ? "zh" : "en";
}

function readStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || localStorage.getItem(LEGACY_ARTICLE_LANGUAGE_KEY);
  } catch (error) {
    return null;
  }
}

function writeStoredLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
    localStorage.removeItem(LEGACY_ARTICLE_LANGUAGE_KEY);
  } catch (error) {
    // Language switching remains available when storage is unavailable.
  }
}

function withPreservedWhitespace(source, translated) {
  const leading = source.match(/^\s*/)?.[0] || "";
  const trailing = source.match(/\s*$/)?.[0] || "";
  return `${leading}${translated}${trailing}`;
}

function getEntry(value) {
  return lookup.get(String(value).trim()) || null;
}

export function translate(value, language = currentLanguage) {
  const entry = getEntry(value);
  return entry ? entry[normalizeLanguage(language)] : value;
}

function applyTextNodeLanguage(node, language) {
  let entry = textEntries.get(node);
  if (!entry) {
    entry = getEntry(node.nodeValue || "");
    if (!entry) return;
    textEntries.set(node, entry);
  }
  node.nodeValue = withPreservedWhitespace(node.nodeValue || "", entry[language]);
}

function applyAttributeLanguage(element, attribute, language) {
  let elementEntries = attributeEntries.get(element);
  if (!elementEntries) {
    elementEntries = new Map();
    attributeEntries.set(element, elementEntries);
  }

  let entry = elementEntries.get(attribute);
  if (!entry) {
    entry = getEntry(element.getAttribute(attribute) || "");
    if (!entry) return;
    elementEntries.set(attribute, entry);
  }
  element.setAttribute(attribute, entry[language]);
}

function applyDocumentLanguage(language) {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.documentElement.dataset.language = language;

  const titleEntry = getEntry(document.title);
  if (titleEntry) document.title = titleEntry[language];

  document.querySelectorAll("[data-language-content], [data-article-language]").forEach((element) => {
    const contentLanguage = element.getAttribute("data-language-content") || element.getAttribute("data-article-language");
    element.hidden = normalizeLanguage(contentLanguage) !== language;
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !parent.closest("script, style, [data-i18n-skip]")) {
      applyTextNodeLanguage(node, language);
    }
    node = walker.nextNode();
  }

  document.querySelectorAll("[title], [aria-label], [alt]").forEach((element) => {
    ["title", "aria-label", "alt"].forEach((attribute) => {
      if (element.hasAttribute(attribute)) applyAttributeLanguage(element, attribute, language);
    });
  });

  document.querySelectorAll('meta[name="description"][content]').forEach((element) => {
    applyAttributeLanguage(element, "content", language);
  });
}

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(language, options = {}) {
  const normalized = normalizeLanguage(language);
  const persist = options.persist !== false;
  const emit = options.emit !== false;
  currentLanguage = normalized;

  if (persist) writeStoredLanguage(normalized);
  applyDocumentLanguage(normalized);

  if (emit) {
    document.dispatchEvent(new CustomEvent("fz:languagechange", { detail: { language: normalized } }));
  }
}

export function initI18n() {
  currentLanguage = normalizeLanguage(readStoredLanguage() || "en");
  writeStoredLanguage(currentLanguage);
  applyDocumentLanguage(currentLanguage);
  document.dispatchEvent(new CustomEvent("fz:languagechange", { detail: { language: currentLanguage } }));

  window.addEventListener("storage", (event) => {
    if (event.key !== LANGUAGE_KEY || !event.newValue) return;
    setLanguage(event.newValue, { persist: false });
  });

  return currentLanguage;
}

window.__fzI18n = {
  getLanguage,
  setLanguage,
  translate
};
