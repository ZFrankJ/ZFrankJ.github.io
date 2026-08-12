const LANGUAGE_KEY = "fz-language";

const translations = new Map([
  ["Data Analytics report", "数据分析报告"],
  ["Home", "首页"],
  ["Finance", "金融"],
  ["Return links", "返回导航"],
  ["Engineering trajectory", "工程历程"],
  ["From Scripts to a System: How a Quant Project Changed the Way I Build with AI", "从脚本到系统：一个量化项目如何改变了我与 AI 协作开发的方式"],
  ["A first-person software-engineering history of learning to build a governed private product in cooperation with AI.", "一篇第一人称的软件工程史：我如何在与 AI 的协作中，学会构建一套治理完善的私有产品。"],
  ["Aug 10, 2026, 6:00 AM UTC", "2026 年 8 月 10 日 06:00（UTC）"],
  ["Aug 10, 2026, 2:00 PM", "2026 年 8 月 10 日 14:00"],
  ["Chapters", "章节"],
  ["01 · Intro", "01 · 引言"],
  ["02 · 2024–mid-2025 · Artifact workbench", "02 · 2024—2025 年中 · 以成果为中心的工作台"],
  ["03 · Git and recoverability", "03 · Git 与可恢复性"],
  ["04 · GUI, launchd, and synchronization", "04 · 图形界面、launchd 与同步"],
  ["05 · Guides, make, and just", "05 · 指南、make 与 just"],
  ["06 · Guarded refactoring", "06 · 受保护的重构"],
  ["07 · Exact-code reconciliation", "07 · 精确代码对账"],
  ["08 · Growth evidence", "08 · 增长证据"],
  ["09 · Why the repository is private", "09 · 仓库为何保持私有"],
  ["10 · Engineering chronology", "10 · 工程历程"],
  ["11 · How the controls became a system", "11 · 各项控制如何形成系统"],
  ["12 · Evidence boundaries", "12 · 证据边界"],
  ["Intro", "引言"],
  ["I began this project by using ChatGPT to turn questions into Python programs, charts, and written conclusions. An early AI-assisted rewrite then changed the direction of the project. I remember", "这个项目始于我用 ChatGPT 将问题转化为 Python 程序、图表和文字结论。后来，一次早期的 AI 辅助改写改变了项目的方向。据我回忆，"],
  ["as the file an agent replaced in a different form. The archive cannot independently prove that incident, but it preserves the environment in which the risk was real: there was no trustworthy before-state, no diff-based review, and no shared contract for what had to survive.", "就是被代理以另一种形式替换的文件。存档无法独立证明这次事件，但保留了当时确实存在风险的环境：没有可信的修改前状态，没有基于差异的审查，也没有共同约定哪些行为必须保留。"],
  ["By the August 2026 stopping point, a significant change moved through a very different system. Git preserved the before-state and the proposed diff. Repository guides identified the existing owner and the behavior that could not drift.", "到 2026 年 8 月的阶段性终点，一项重要改动已经在一套截然不同的系统中推进。Git 保存修改前状态和拟议差异；仓库指南指出既有的职责归属，以及不可偏移的行为。"],
  ["encoded verification and the development lifecycle. Reconciliation authenticated whether the evidence belonged to one exact commit and its declared review scope. Machine-sensitive work added isolated production evidence, while I retained the merge decision.", "把验证和开发生命周期编码为可执行流程；对账机制鉴别证据是否真正属于某个精确提交及其声明的审查范围。涉及机器环境的工作还会补充隔离的生产证据，而合并决定始终由我保留。"],
  ["My", "我的"],
  ["personal finance page", "个人金融页面"],
  ["records the visible outputs of the journey. This article records the engineering underneath them: how each limit in my previous way of working led to a stronger control for organizing code, operating a product, and cooperating with AI.", "记录了这段历程中可见的成果。本文则记录这些成果背后的工程：过去工作方式中的每一项局限，如何促使我建立更强的控制，以组织代码、运营产品并与 AI 协作。"],
  ["The central result is not 64,000 lines of code. It is a layered control system for building with AI:", "核心成果并不是 64,000 行代码，而是一套用于与 AI 协作开发的分层控制系统："],
  ["Git made change recoverable; the GUI dashboard made the work usable; launchd jobs and synchronization made it operable across time and machines; repository guides made architecture legible;", "Git 让改动可恢复；图形仪表盘让工作可使用；launchd 任务与同步让系统能够跨时间、跨机器运行；仓库指南让架构清晰可读；"],
  ["made policy repeatable; and reconciliation bound merge-readiness evidence to exact code.", "让政策能够重复执行；对账机制则把合并就绪证据绑定到精确代码。"],
  ["The scale changed sharply. The first preserved tree of the current repository, dated 4 January 2026, contained 11 tracked files and 2,201 lines of production source—first-party tracked code, excluding tests, data, configuration, lockfiles, and binaries. At the 4 August stopping point, it contained 344 tracked files, 61,869 source lines, 44,363 test lines, and 19,502 lines of Markdown. A later size-only audit on 9 August measured 64,902 source lines, which is why “64k LOC” is accurate today; the narrative itself deliberately ends on 4 August.", "规模迅速扩大。当前仓库最早保留的目录树日期为 2026 年 1 月 4 日，当时有 11 个跟踪文件和 2,201 行生产源代码——这里只计算第一方跟踪代码，不含测试、数据、配置、锁文件和二进制文件。到 8 月 4 日的阶段性终点，仓库已有 344 个跟踪文件、61,869 行源代码、44,363 行测试代码和 19,502 行 Markdown。8 月 9 日一次仅统计规模的审计测得 64,902 行源代码，因此如今称为“64k LOC”是准确的；但本文叙事有意止于 8 月 4 日。"],
  ["Size is context, not the achievement. The unit of progress changed from a visible answer, to a preserved program, to an operated product, and finally to a narrow change whose owner, behavior, environment, and exact revision could all be checked. I did not respond to one damaging misunderstanding by abandoning AI assistance. I responded by giving the collaboration a technical interface.", "规模只是背景，不是成就本身。进步的单位从一个可见答案，变成一个被保存的程序，再变成一个可运营的产品，最终变成一项能够检查职责归属、行为、环境和精确版本的窄范围改动。面对一次破坏性的误解，我没有放弃 AI 辅助，而是为这场协作建立了技术接口。"],
  ["The report keeps the full chronology, but chronology is supporting evidence rather than the spine. The control map below states the main engineering argument before the later chapters examine each transformation. This is a software-development account, not an explanation of quantitative techniques. It contains no signals, formulas, parameters, instrument identifiers, holdings, positions, or decision rules, and it embeds no loaded product screenshot.", "报告保留完整时间线，但时间线只是支撑证据，而非文章主轴。下方的控制图先陈述核心工程论点，后续章节再逐一审视每次转变。这是一篇软件开发记录，并非量化技术说明；其中不包含信号、公式、参数、标的代码、持仓、头寸或决策规则，也没有嵌入已加载数据的产品截图。"],
  ["Three evidence verbs keep the history honest.", "三个证据动词让这段历史保持诚实。"],
  ["Git records", "Git 记录"],
  ["means a dated commit, tag, or merged pull request.", "指带日期的提交、标签或已合并的拉取请求。"],
  ["The archive preserves", "存档保留"],
  ["means a surviving filename, directory structure, byte match, or filesystem timestamp from an old copied folder; those clues are useful but weaker than commit history.", "指旧复制文件夹中仍存在的文件名、目录结构、字节匹配或文件系统时间戳；这些线索有用，但弱于提交历史。"],
  ["I remember", "据我回忆"],
  ["marks my own account, especially the early GPT-4 period and the agent-rewrite incident. The story is strongest when those evidence levels are not blurred together.", "标记我的个人叙述，尤其是早期 GPT-4 阶段和代理改写事件。只有不混淆这些证据层级，这段故事才最可信。"],
  ["The controls that changed the project", "改变项目的控制机制"],
  ["Control introduced", "引入的控制"],
  ["Failure it addressed", "所解决的失效"],
  ["Capability it created", "所创造的能力"],
  ["Git control", "Git 控制"],
  ["An AI edit had no trustworthy before-state or reviewable change unit.", "AI 编辑没有可信的修改前状态，也没有可审查的改动单元。"],
  ["Diff, rollback, attribution, and an explicit source-versus-output boundary.", "差异、回滚、归因，以及明确的源代码与输出边界。"],
  ["GUI dashboard and application layer", "图形仪表盘与应用层"],
  ["Operation depended on terminal knowledge, while the interface duplicated execution and discovery logic.", "操作依赖终端知识，同时界面重复实现了执行与发现逻辑。"],
  ["A family-facing interface over bounded jobs, canonical commands, and saved-run discovery.", "面向家人的界面，建立在有界任务、规范命令和已保存运行发现机制之上。"],
  ["launchd jobs and synchronization", "launchd 任务与同步"],
  ["Manual timing and unclear authority across multiple machines made unattended operation unsafe.", "人工定时和多台机器之间不清晰的权限，使无人值守运行并不安全。"],
  ["UTC scheduling with explicit primary, standby, and scheduler-only roles.", "采用 UTC 调度，并明确主机、备用机和仅调度机器的角色。"],
  ["Repository guides and contracts", "仓库指南与契约"],
  ["A new agent had to guess ownership, preservation boundaries, and what to read first.", "新代理不得不猜测职责归属、保留边界和首先应阅读的内容。"],
  ["A low-context route from goal to owner, invariant, local guide, and guard test.", "一条低上下文路径：从目标通向职责归属、不变量、本地指南与防护测试。"],
  ["Verification and the Git lifecycle depended on a person remembering every step in the right order.", "验证与 Git 生命周期依赖某个人按正确顺序记住每一步。"],
  ["Executable quality gates and a repeatable clean-main-to-ready-PR protocol.", "可执行的质量门，以及可重复的“干净 main 到就绪 PR”协议。"],
  ["Exact-SHA reconciliation", "精确 SHA 对账"],
  ["Passing evidence could belong to different code, a different environment, or a false lineage claim.", "通过的证据可能属于不同代码、不同环境，或虚假的版本谱系声明。"],
  ["Multi-machine and server-shadow evidence bound to the exact reviewed revision.", "将多机和服务器影子证据绑定到被审查的精确版本。"],
  ["The first interface was the artifact — 2024 to mid-2025", "最初的界面就是成果本身——2024 至 2025 年中"],
  ["The earliest phase was an artifact-driven learning loop. I remember it as beginning with GPT-4-assisted data analysis around 2024. The public page names ChatGPT but not the model, and its first dated Python-backed milestone is August 2024, so the model and approximate starting period remain my recollection rather than a fact proven by the website.", "最早阶段是一套由成果驱动的学习循环。据我回忆，它始于 2024 年前后由 GPT-4 辅助的数据分析。公开页面提到了 ChatGPT，却没有注明模型；首个有日期、由 Python 支撑的里程碑是 2024 年 8 月。因此，具体模型和大致起始时间仍属于我的回忆，并非网站能够证明的事实。"],
  ["The August entry shows the essential pattern: a question became a program, charts, and a publishable explanation. The same loop was reused in September; reading and structured communication joined it in October; historical comparisons and validation limits were more explicit by February 2025; richer visual synthesis appeared in July. These public milestones matter because they show the project learning to communicate, not just calculate.", "8 月的记录展示了基本模式：一个问题变成程序、图表和可发布的解释。同一循环在 9 月再次使用；10 月加入阅读与结构化表达；到 2025 年 2 月，历史比较和验证边界更加明确；7 月则出现更丰富的视觉综合。这些公开里程碑之所以重要，是因为它们表明项目学习的不只是计算，还有表达。"],
  ["The surviving", "现存的"],
  ["folder shows the operating interface behind those results: run a script, inspect text or a plot, and preserve the neighboring files. It has no Git history, README, dependency manifest, package structure, CI, or engineering guide. Of 243 preserved files, 228 sit at the root. No local script imports another. Four filenames contain the word “test,” but none contains an automated project test; at that stage, testing meant running an experiment and judging its output. One third-party source file also contributes 876 of the folder's 7,860 Python lines, so the gross line count cannot honestly be presented as entirely authored work.", "文件夹展示了这些成果背后的操作界面：运行脚本，查看文本或图表，再保存相邻文件。它没有 Git 历史、README、依赖清单、包结构、CI 或工程指南。243 个保留文件中有 228 个直接位于根目录；本地脚本之间互不导入。四个文件名含有“test”，但没有一个包含自动化项目测试；当时的测试就是运行实验并判断输出。另有一个第三方源文件贡献了该文件夹 7,860 行 Python 中的 876 行，因此不能把总行数全都诚实地称作本人创作。"],
  ["This structure was not simply “bad code.” It was a productive workbench optimized for short feedback loops. Code, input files, figures, screenshots, spreadsheets, and prose stayed close because every visible artifact suggested the next question. Its success created the limitation: as variants and outputs accumulated, filenames began acting as version history, and it became harder to distinguish source from evidence or current work from a preserved experiment.", "这种结构不能简单归为“糟糕的代码”。它是一座为短反馈循环优化、富有产出的工作台。代码、输入文件、图像、截图、表格和文字彼此相邻，因为每一项可见成果都会引出下一个问题。成功本身也带来了局限：随着变体和输出累积，文件名开始充当版本历史，源代码与证据、当前工作与保留实验之间愈发难以区分。"],
  ["The first engineering lesson was therefore modest but durable: producing knowledge and preserving the conditions that produced it are different jobs.", "因此，第一条工程经验朴素却持久：生产知识与保存产生知识的条件，是两项不同的工作。"],
  ["Git made AI-assisted change recoverable — the Pure boundary", "Git 让 AI 辅助改动可恢复——Pure 边界"],
  ["began as a code boundary before it became a governed repository. Archive comparison found three earlier files and three systematically renamed Pure files that are byte-identical, with matching sizes and June–July 2025 timestamps but separate inodes. Selected programs had therefore been copied into a numbered series before Git was initialized.", "在成为受治理的仓库之前，首先是一条代码边界。存档对比发现三个早期文件与三个按规则重命名的 Pure 文件逐字节相同：大小一致，时间戳都在 2025 年 6 至 7 月，但 inode 不同。因此，在初始化 Git 之前，选定程序已经被复制成一个编号序列。"],
  ["Git changed the unit of collaboration from a file to a diff", "Git 将协作单位从文件变成差异"],
  ["Failure exposed.", "暴露的问题。"],
  ["Before Git, a polished AI edit could still be destructive because there was no trustworthy before-state. Filename variants preserved some history, but they could not show exactly what changed, who changed it, or whether the earlier version remained recoverable.", "在使用 Git 之前，一次看似精致的 AI 编辑仍可能具有破坏性，因为没有可信的修改前状态。文件名变体保留了一部分历史，却无法准确显示改了什么、由谁修改，以及早期版本是否仍可恢复。"],
  ["Design decision.", "设计决策。"],
  ["I introduced Git not merely to save files, but to require every committed change to have a parent, a diff, and a possible rollback. The logical Pure phase predates version control; Git history begins on 21 November 2025.", "我引入 Git 不只是为了保存文件，而是要求每项已提交改动都具备父版本、差异和回滚可能。逻辑上的 Pure 阶段早于版本控制；Git 历史始于 2025 年 11 月 21 日。"],
  ["Concrete proof.", "具体证据。"],
  ["The first commit tracked 85 files occupying 11.82 MB. About seventy minutes later, a", "第一次提交跟踪了 85 个文件，共占 11.82 MB。大约七十分钟后，新增了一个"],
  ["was added and 54 data or generated-result files were removed from tracking, leaving 32 files and 4.57 MB. That was the first explicit source-versus-output contract: code history belonged in Git; bulky inputs and generated evidence did not.", "，并将 54 个数据或生成结果文件移出跟踪范围，剩余 32 个文件和 4.57 MB。这是第一份明确的源代码与输出契约：代码历史属于 Git；庞大的输入和生成证据则不属于。"],
  ["New guarantee.", "新的保证。"],
  ["An AI edit was no longer an opaque replacement. It could be inspected, rejected, traced, or reverted. The later current-repository workflow strengthened that guarantee with one short-lived branch per reviewable slice, explicit staging, attributable commits and pull requests, and human merge authority.", "AI 编辑不再是一次不透明的替换；它可以被检查、拒绝、追踪或撤销。后来当前仓库的工作流进一步强化了这一保证：每个可审查切片使用一条短期分支，明确暂存范围，通过提交和拉取请求进行归因，并由人保留合并权限。"],
  ["Pure was still not a framework. Its 24 Python programs remained in one flat directory, 21 were directly executable, and there was no automated test suite, dependency declaration, README, CI, remote review, agent guide, or package ownership model. Git made change recoverable; it did not yet tell an agent where behavior belonged or what must be preserved.", "Pure 仍不是框架。24 个 Python 程序仍放在一个扁平目录中，其中 21 个可直接执行；没有自动化测试套件、依赖声明、README、CI、远程审查、代理指南或包职责模型。Git 让改动可恢复，却尚未告诉代理行为应归属何处、哪些内容必须保留。"],
  ["That remaining limit became personal. I remember the earlier file now named", "这项残余局限最终影响到了我自己。据我回忆，早期文件如今名为"],
  ["as the one an agent misunderstood and rewrote in a different way. Git proves only that the filename entered Pure history on 29 December 2025. It does not prove who rewrote it, when the incident occurred, or what instruction preceded it, so the identification remains my recollection.", "，它曾被一个代理误解并以不同方式重写。Git 只能证明这个文件名于 2025 年 12 月 29 日进入 Pure 历史；它无法证明由谁改写、事件发生时间或此前的指令，因此这项辨认仍属于我的回忆。"],
  ["The lasting lesson is stronger than the disputed detail: AI had increased editing speed before our collaboration had reliable checkpoints or review boundaries.", "比有争议的细节更重要的是那条持久经验：在协作具备可靠检查点和审查边界之前，AI 已先提高了编辑速度。"],
  ["Git was not a storage upgrade. It was the first governance layer between human intent and AI action.", "Git 不是一次存储升级，而是人类意图与 AI 行动之间的第一层治理。"],
  ["The GUI, launchd, and synchronization made the project operable", "图形界面、launchd 与同步让项目可运营"],
  ["The current repository's preserved history begins on 4 January 2026 with a README, configuration, one main runner, and a small package. Git cannot establish exactly how much logic was inherited from the older folders, but it records the point at which correctness stopped depending only on me remembering how to operate the code.", "当前仓库保留的历史始于 2026 年 1 月 4 日，当时包含 README、配置、一个主运行器和一个小型包。Git 无法确定有多少逻辑继承自旧文件夹，但它记录了一个转折点：正确性不再只依赖我记得如何操作代码。"],
  ["Three product surfaces exposed three different engineering failures. The GUI needed commands, background jobs, saved-history discovery, and presentation at once. launchd could run the code while nobody was watching. Synchronization made machine identity and authority part of correctness. Solving those problems—not merely drawing a better screen—is what turned the project into a product.", "三个产品界面暴露出三种不同的工程失效。图形界面同时需要命令、后台任务、历史发现与呈现；launchd 能在无人看守时执行代码；同步则使机器身份和权限成为正确性的一部分。正是解决这些问题——而不只是画出更好的界面——让项目成为产品。"],
  ["The GUI dashboard forced the project to acquire an application layer", "图形仪表盘迫使项目建立应用层"],
  ["The first web prototype added more than 1,600 lines, and by mid-February the dashboard path was roughly 5,000 lines. Command construction, process launching, folder scanning, file interpretation, and presentation had gathered behind one interface. The dashboard was becoming a second implementation of the product.", "第一个网页原型新增了 1,600 多行代码；到 2 月中旬，仪表盘路径约有 5,000 行。命令构造、进程启动、文件夹扫描、文件解释和呈现都聚集在一个界面背后。仪表盘正在变成产品的第二套实现。"],
  ["On 16 February, I separated web routing, services, and frontend assets. A formal application layer followed with explicit owners for command preparation, bounded jobs, process lifecycle, saved-run discovery, artifacts, and cross-layer contracts. The dashboard could request work and present a result; it could no longer invent how the work was performed.", "2 月 16 日，我拆分了网页路由、服务与前端资源。随后建立正式应用层，为命令准备、有界任务、进程生命周期、已保存运行发现、成果和跨层契约明确职责归属。仪表盘可以请求工作并呈现结果，但不能再自行发明工作如何执行。"],
  ["Enforcement.", "执行约束。"],
  ["Repository discipline rules prohibit dashboard modules from directly owning subprocess execution, configuration parsing, or result-tree discovery. Cross-layer and route-parity tests guard shared paths so the command-line, scheduler, and GUI surfaces reuse canonical behavior instead of independently reimplementing it.", "仓库纪律规则禁止仪表盘模块直接负责子进程执行、配置解析或结果树发现。跨层和路由一致性测试守护共享路径，使命令行、调度器和图形界面复用规范行为，而不是各自重新实现。"],
  ["Capability created.", "形成的能力。"],
  ["The multilingual dashboard and double-clickable macOS application made saved history and bounded operation usable without terminal knowledge. More importantly, a presentation change no longer needed authority over execution and storage. The GUI created an architectural boundary, not just a visual layer.", "多语言仪表盘和可双击启动的 macOS 应用，让不具备终端知识的人也能使用已保存历史和有界操作。更重要的是，呈现层改动不再需要掌控执行与存储。图形界面创造的是架构边界，而不只是视觉层。"],
  ["launchd and synchronization created a role-aware operating model", "launchd 与同步建立了角色感知的运行模型"],
  ["Manual operation depended on somebody remembering when and where to run the project. Introducing macOS launchd jobs on 8 January removed that dependency, but unattended execution created a harder question: once several Macs participated, which machine was authoritative, which one provided fallback capacity, and which ones could refresh a local view without publishing shared state?", "人工操作依赖某个人记得何时、在哪里运行项目。1 月 8 日引入 macOS launchd 任务后，这种依赖被移除，但无人值守执行又带来更难的问题：当多台 Mac 参与时，哪台机器拥有权威，哪台提供回退能力，哪些机器只能刷新本地视图而不能发布共享状态？"],
  ["The repository introduced", "仓库引入了"],
  ["roles, canonical UTC scheduling, one synchronization-status contract, and a gate that decided whether distributed state was safe to consume. Shell launchers performed process wiring; the application layer owned the decision. The primary owned the normal publication path, the standby owned bounded fallback, and scheduler-only machines remained explicitly non-authoritative.", "角色、规范的 UTC 调度、统一的同步状态契约，以及判断分布式状态是否可安全使用的门控。Shell 启动器负责进程连接，应用层负责决策。主机拥有正常发布路径，备用机负责有界回退，仅调度机器则被明确设为非权威。"],
  ["Synchronization schemas, scheduling slots, machine roles, and fallback behavior became explicit contracts with guard tests. A wrapper could not quietly invent a different publication decision, and a local scheduler could not promote itself into the authority role.", "同步模式、调度时段、机器角色和回退行为都成为由防护测试保障的明确契约。包装器不能悄悄发明不同的发布决策，本地调度器也不能自行提升为权威角色。"],
  ["This was stronger than “adding syncing.” It was a small distributed operating model: jobs could run without me, machines had declared responsibilities, fallback was bounded, and local refreshes did not redefine shared truth.", "这比“增加同步”更进一步。它是一套小型分布式运行模型：任务可以在我不在场时运行，机器拥有声明的职责，回退受到约束，本地刷新也不会重新定义共享事实。"],
  ["Saved history and scheduler state became contracts", "已保存历史与调度器状态成为契约"],
  ["A history screen is trustworthy only if it can recover an earlier run without the developer remembering filenames. Early discovery inferred meaning from directory structure, while operational status was reconstructed from independently written logs, task files, and history. That worked as personal convention; it was a fragile machine interface.", "只有无需开发者记住文件名就能恢复早期运行，历史界面才值得信任。早期发现机制从目录结构推断含义，运行状态则由分别写入的日志、任务文件和历史记录重新拼合。这种个人惯例能够工作，却是一种脆弱的机器接口。"],
  ["Each newly written canonical saved run gained a manifest and declared artifact list; canonical writers updated an indexed job manifest; and one filesystem repository became responsible for discovery. The scheduler likewise gained a versioned state snapshot written by the scheduler and validated by the dashboard. Human-readable logs were derived from the same structured state instead of being parsed back into authority.", "每次新写入的规范保存运行都获得清单和声明的成果列表；规范写入器更新索引任务清单；一个文件系统仓库统一负责发现。调度器同样拥有由自身写入、由仪表盘验证的版本化状态快照。人类可读日志从同一结构化状态派生，而不再被反向解析成权威来源。"],
  ["The saved-run contract is an invariant with named owners and tests. Recursive scanning remains only as a bounded bootstrap or legacy fallback. Unknown, malformed, or stale scheduler state is rejected or handled through an explicit compatibility path rather than guessed around. Normal macOS live output moved outside the source checkout by default so Git and unattended operation no longer competed for ownership of the same files.", "已保存运行契约成为具名职责方和测试守护的不变量。递归扫描仅保留为有界的启动或旧版回退机制。未知、格式错误或过期的调度器状态会被拒绝，或通过明确兼容路径处理，而不是靠猜测绕过。常规 macOS 实时输出默认移到源码检出之外，使 Git 与无人值守运行不再争夺同一批文件的所有权。"],
  ["A result became an indexed record instead of “something in a folder,” and operational status became an API between launchd and the dashboard instead of a collection of loosely related logs.", "结果从“文件夹里的某个东西”变成索引记录，运行状态则从一组松散日志变成 launchd 与仪表盘之间的 API。"],
  ["On 30 January, CI, structured pytest layers, regression snapshots, maintainability reporting, and a standard verification entry point also changed the meaning of “finished.”", "1 月 30 日，CI、结构化 pytest 分层、回归快照、可维护性报告和标准验证入口，也改变了“完成”的含义。"],
  ["The GUI made the system usable; launchd and synchronization made it operational; explicit application and state contracts made all three surfaces trustworthy.", "图形界面让系统可用；launchd 与同步让它可运营；明确的应用与状态契约让三个界面都值得信任。"],
  ["Guides, make, and just became the interface for AI", "指南、make 与 just 成为 AI 的接口"],
  ["A 64,000-line repository cannot be summarized safely in one prompt. Product growth exposed a new failure mode: neither my future self nor a newly assigned agent could infer ownership, preservation boundaries, and the correct workflow from filenames and conversational context alone. I treated documentation as a control plane that routes an agent from a goal to the canonical owner or owners within one bounded packet.", "一个拥有 64,000 行代码的仓库，不可能在一条提示词中被安全概括。产品增长暴露出新的失效模式：未来的我或新分配的代理，都无法仅凭文件名和对话上下文推断职责归属、保留边界与正确工作流。我把文档视为控制平面，用一个有界任务包，将代理从目标引导到一个或多个规范职责方。"],
  ["Documentation became a routing system, not a catalog", "文档成为路由系统，而不是目录"],
  [", added on 10 January, was only 27 lines. It could state authority and prohibitions, but it could not describe an expanding architecture or recover decisions lost with an old chat.", "于 1 月 10 日加入时只有 27 行。它能够说明权限与禁令，却无法描述不断扩展的架构，也无法找回随旧对话丢失的决策。"],
  ["Instead of creating one enormous instruction file, I assigned each repository document one operational question:", "我没有创建一个庞大的指令文件，而是让每份仓库文档回答一个运行问题："],
  ["Priority.", "优先级。"],
  ["states what matters next.", "说明接下来什么最重要。"],
  ["Scope.", "范围。"],
  ["One", "一份"],
  ["packet defines the current change, exclusions, tests, and exit criteria.", "任务包定义当前改动、排除项、测试和退出标准。"],
  ["Discovery.", "发现。"],
  ["prescribes what a low-context agent reads and searches first.", "规定低上下文代理首先阅读和搜索什么。"],
  ["Ownership.", "职责归属。"],
  ["Architecture and canonical-API maps identify where behavior belongs and which calls are supported.", "架构图和规范 API 图标明行为归属何处、哪些调用受到支持。"],
  ["Preservation.", "保留边界。"],
  ["Invariants name behavior that cannot drift casually; the technical-debt registry names risks that must not receive another workaround.", "不变量指出不能随意偏移的行为；技术债登记表指出不能再用临时变通掩盖的风险。"],
  ["Local context.", "局部上下文。"],
  ["Folder guides and file sidecars place constraints next to the code they govern.", "文件夹指南和文件伴随文档把约束放在其所治理的代码旁边。"],
  ["Durable memory.", "持久记忆。"],
  ["records architecture and policy decisions that must survive beyond one conversation.", "记录必须跨越单次对话而长期保留的架构与政策决策。"],
  ["The guide validator checks coverage, required sections, and referenced dependencies. The source-inspection discipline checker rejects duplicate canonical owners, prohibited dependency directions, direct result-tree ownership, and malformed invariant references. Important prose therefore participates in deciding whether a change is acceptable.", "指南验证器检查覆盖范围、必需章节和引用依赖。源码检查纪律工具拒绝重复的规范职责方、被禁止的依赖方向、直接占有结果树，以及格式错误的不变量引用。因此，重要文字也参与决定一项改动是否可接受。"],
  ["A new agent no longer has to reconstruct the system by intuition. It can follow a bounded route from the goal, to the current packet, to the canonical owner, to the invariant and tests that define safe completion.", "新代理不再需要凭直觉重建系统。它可以沿一条有界路径，从目标到当前任务包，再到规范职责方，最后抵达定义安全完成条件的不变量与测试。"],
  ["make verifies the change; just governs its lifecycle", "make 验证改动；just 治理其生命周期"],
  ["The Makefile became the standard verification entry point on 30 January. The", "Makefile 于 1 月 30 日成为标准验证入口。"],
  ["arrived in April to standardize Git and review operations. Their value is not shorter typing; it is that they encode different forms of policy.", "在 4 月加入，用于规范 Git 与审查操作。它们的价值不在于少打几个字，而在于编码不同形式的政策。"],
  ["make check answers: “What evidence must this change pass?”", "make check 回答：“这项改动必须通过哪些证据？”"],
  ["It surrounds verification with a live-artifact guard, validates guide coverage, enforces architecture discipline, runs formatting and lint checks, executes the automated tests and base snapshots, produces maintainability evidence, and then proves that verification did not alter protected live state. A convenient single test cannot substitute for the repository's full contract.", "它以实时成果防护包围验证流程，验证指南覆盖，执行架构纪律，运行格式与静态检查，执行自动化测试和基础快照，生成可维护性证据，最后证明验证没有更改受保护的实时状态。一个方便的单项测试不能替代仓库的完整契约。"],
  ["just answers: “What is the safe route from clean main to a reviewed candidate?”", "just 回答：“从干净的 main 到经过审查的候选版本，安全路径是什么？”"],
  ["Its lifecycle is explicit:", "其生命周期清晰明确："],
  ["Establish a safe base.", "建立安全基线。"],
  ["Synchronize and confirm clean current", "同步并确认当前"],
  ["Create one review slice.", "创建一个审查切片。"],
  ["Start a short-lived branch for one bounded packet.", "为一个有界任务包启动一条短期分支。"],
  ["Create an attributable candidate.", "创建可归因的候选版本。"],
  ["Stage intended paths, commit with task and branch identity, and push one exact SHA.", "暂存指定路径，使用任务和分支身份提交，并推送一个精确 SHA。"],
  ["Bind evidence.", "绑定证据。"],
  ["Run the required checks and exact-candidate reconciliation for that SHA.", "为该 SHA 运行所需检查和精确候选版本对账。"],
  ["Request review.", "请求审查。"],
  ["Create a ready pull request only after the helper revalidates the immutable result; the pull request records the reason, verification, and risks.", "只有辅助工具重新验证不可变结果后，才创建就绪拉取请求；拉取请求记录原因、验证与风险。"],
  ["Restore unattended safety.", "恢复无人值守安全。"],
  ["Return the scheduler-bound development clone to clean", "在审查期间，将绑定调度器的开发克隆恢复到干净的"],
  ["while review is pending.", "状态。"],
  ["By July, the same command layer rejected failed, stale, scope-incompatible, or wrong-head evidence.", "到 7 月，同一命令层会拒绝失败、过期、范围不兼容或头部版本错误的证据。"],
  ["Documentation supplied context; make and just converted that context into a protocol that a person or AI could execute consistently.", "文档提供上下文；make 与 just 将上下文转化为人或 AI 都能一致执行的协议。"],
  ["Narrow packets replaced ambiguous “next step” prompts", "窄范围任务包取代含糊的“下一步”提示"],
  ["By June, the development log recorded that prompts such as “work on the next step” were too easy to interpret as permission to continue refactoring, invent another milestone, or broaden scope.", "到 6 月，开发日志已经记录：“处理下一步”之类的提示很容易被理解为继续重构、发明新里程碑或扩大范围的许可。"],
  ["The implementation plan became an execution contract between owner, agent, and reviewer. One ordered packet named the responsibility, relevant files, tests written first, explicit exclusions, documentation duties, exit criteria, and a stopping boundary before the next packet.", "实施计划成为所有者、代理与审查者之间的执行契约。一个有序任务包会明确职责、相关文件、先写的测试、明确排除项、文档责任、退出标准，以及进入下一个任务包前的停止边界。"],
  ["Attribution.", "归因。"],
  ["The branch became the review unit. Commits recorded the Codex task and branch; pull requests recorded what changed, why, verification, and risks. Later", "分支成为审查单位。提交记录 Codex 任务与分支；拉取请求记录改了什么、为何改、如何验证及其风险。此后，"],
  ["could lead from a line to the originating review slice even after conversational memory disappeared.", "即使对话记忆已经消失，也能从某一行追溯到最初的审查切片。"],
  ["AI could still explore and implement quickly, but repository context bounded where it acted, executable checks could reject unsupported change, Git preserved the diff, and I retained merge authority. The prompt remained important; it was no longer the entire safety system.", "AI 仍能快速探索和实现，但仓库上下文约束其行动范围，可执行检查拒绝不受支持的改动，Git 保存差异，而我保留合并权限。提示词仍然重要，却不再是全部安全系统。"],
  ["Refactoring moved ownership without rewriting behavior", "重构转移职责，而不重写行为"],
  ["On 21 May, the annotated", "5 月 21 日，带注释的"],
  ["tag called itself the", "标签将自己称为"],
  ["“end of great expansion.”", "“大扩张的终点”。"],
  ["The challenge was no longer adding capability. It was reducing how much authority one change required. A presentation adjustment could still touch orchestration, persistence, file discovery, and rendering in the same path.", "挑战不再是增加能力，而是减少一项改动所需的权限范围。一次呈现调整仍可能沿同一路径触及编排、持久化、文件发现和渲染。"],
  ["Replacing a large file wholesale would have repeated the earlier agent-rewrite risk at production scale. A cleaner-looking rewrite could silently change supported entry points, stored behavior, or operational assumptions.", "整体替换大型文件，会在生产规模上重演早期代理改写风险。看起来更整洁的重写，可能悄悄改变受支持入口、存储行为或运行假设。"],
  ["I used branch by abstraction: retain the old callable as a thin compatibility facade, move one cohesive responsibility behind it, and delete the facade only when evidence showed that no supported caller still needed it.", "我采用抽象分支法：保留旧可调用接口作为薄兼容外观，将一项内聚职责移到其背后；只有证据表明所有受支持调用方都不再需要它时，才删除外观。"],
  ["The guarded ownership-transfer protocol", "受保护的职责转移协议"],
  ["Guard the existing behavior.", "守护既有行为。"],
  ["Add tests and snapshots around the supported route before moving it.", "在移动前，围绕受支持路径添加测试和快照。"],
  ["Name one responsibility.", "命名一项职责。"],
  ["Define the boundary narrowly enough for one review packet.", "把边界定义得足够窄，使其适合一个审查任务包。"],
  ["Move the canonical owner.", "转移规范职责方。"],
  ["Transfer the implementation without widening its authority.", "转移实现，但不扩大其权限。"],
  ["Preserve the facade.", "保留兼容外观。"],
  ["Keep old imports and callers working while they delegate to the new owner.", "让旧导入和调用方继续工作，同时委托给新的职责方。"],
  ["Assert dependency direction.", "断言依赖方向。"],
  ["Test what the new owner is forbidden to import or perform.", "测试新职责方被禁止导入或执行的内容。"],
  ["Verify the proposed revision.", "验证拟议版本。"],
  ["Prove both behavior and structure with the gates applicable at that stage.", "用该阶段适用的门控，同时证明行为与结构。"],
  ["Stop at the packet boundary.", "在任务包边界停止。"],
  ["Do not use a successful extraction as permission to begin another.", "不要把一次成功抽取当作开始下一次抽取的许可。"],
  ["The work began by inventorying the supported surface. Scheduler state received a versioned contract, a canonical writer, and a validated reader. Persistence and live-result locations gained explicit owners. Structured logs and route-parity checks made external behavior visible before internal code moved. From late May through mid-July, large modules transferred state, timing, component, orchestration, registration, rendering, and presentation responsibilities one at a time. PR #166 on 15 July explicitly closed the main ownership refactor.", "工作从盘点受支持界面开始。调度器状态获得版本化契约、规范写入器和经过验证的读取器；持久化与实时结果位置获得明确职责方；结构化日志与路由一致性检查在内部代码移动前使外部行为可见。从 5 月下旬到 7 月中旬，大型模块逐一转移状态、时序、组件、编排、注册、渲染和呈现职责。7 月 15 日的 PR #166 明确结束了主要职责重构。"],
  ["The August closeout provides three compact examples of what “safe extraction” meant. None requires disclosing a quantitative method:", "8 月的收尾工作用三个简洁案例说明“安全抽取”的含义；其中均无需披露量化方法："],
  ["Stored completed-run evidence.", "已存储的完成运行证据。"],
  ["An execution-free evidence owner moved behind the existing runner. Old and new paths had to persist byte-identical files; missing or path-escaping tables failed instead of being silently repaired.", "一个不执行任务的证据职责方被移到既有运行器背后。新旧路径必须保存逐字节相同的文件；表格缺失或路径越界时直接失败，而不是静默修复。"],
  ["Prepared-result text projection.", "已准备结果的文本投影。"],
  ["Reporting became the new owner while the command adapter retained orchestration. Structural checks prohibited the renderer from parsing requests, executing work, saving evidence, or plotting.", "报告层成为新的职责方，命令适配器保留编排。结构检查禁止渲染器解析请求、执行工作、保存证据或绘图。"],
  ["Completed-result figure construction.", "完成结果的图像构建。"],
  ["A presentation-only plotting owner moved behind the old public call. Compatibility tests required delegation with unchanged arguments; the new owner could not load data or construct artifact paths.", "仅负责呈现的绘图职责方被移到旧公共调用背后。兼容测试要求以不变参数委托；新职责方不能加载数据或构造成果路径。"],
  ["These extractions were valuable because they reduced the change surface. A future text adjustment no longer had to reopen execution and persistence logic. A figure change no longer needed authority to discover or rewrite stored evidence. Tests checked outputs, but structural guards also checked what the new owners were forbidden to import. Behavior and dependency direction were both part of correctness.", "这些抽取之所以有价值，是因为它们缩小了改动面。未来的文字调整无需再打开执行与持久化逻辑；图像改动也无需获得发现或重写存储证据的权限。测试检查输出，结构防护还检查新职责方禁止导入的内容。行为和依赖方向都是正确性的一部分。"],
  ["Refactoring did not make the repository smaller. Between 21 May and 4 August, production source grew by about one third while tests nearly doubled and Markdown almost tripled. Safe ownership transfer added contracts, compatibility checks, and documentation.", "重构没有让仓库变小。从 5 月 21 日到 8 月 4 日，生产源代码增长约三分之一，测试几乎翻倍，Markdown 接近三倍。安全职责转移增加了契约、兼容检查和文档。"],
  ["The refactor succeeded because future changes required authority over fewer responsibilities—not because a line-count metric fell.", "重构成功，是因为未来改动所需掌控的职责更少，而不是因为行数指标下降。"],
  ["The measured closeout on 4 August made that principle concrete. The audit retained compatibility facades still used by runtime paths, public imports, stored runs, or tests. It refused deletion performed only to improve a maintainability score. A successful refactor had reduced urgent architectural concentration; it did not need to erase every old route to prove its value.", "8 月 4 日的量化收尾让这一原则具体化。审计保留仍被运行路径、公共导入、已保存运行或测试使用的兼容外观；拒绝仅为提高可维护性评分而进行的删除。成功的重构已经降低紧急的架构集中度，无需抹去每条旧路径来证明价值。"],
  ["Reconciliation bound evidence to exact code", "对账机制将证据绑定到精确代码"],
  ["A test run can prove that commit A passed while the pull request now points at commit B. A branch name can move; one machine can hide environment drift; and an internally self-consistent evidence file can still describe false lineage. After the main ownership refactor, production hardening therefore changed the object being verified.", "一次测试运行可以证明提交 A 通过，但拉取请求此刻可能已经指向提交 B。分支名会移动；一台机器可能掩盖环境偏移；内部自洽的证据文件仍可能描述虚假的版本谱系。因此，在主要职责重构之后，生产加固改变了被验证的对象。"],
  ["Tests answer whether behavior passed. Reconciliation answers whether that evidence belongs to this exact code, a compatible environment, and the declared review scope; the human review decision remains separate.", "测试回答行为是否通过。对账回答证据是否属于这份精确代码、兼容环境和声明的审查范围；人的审查决定仍与之分离。"],
  ["Binding evidence to an exact candidate", "将证据绑定到精确候选版本"],
  ["The reconciliation workflow established a chain of independently checked identities:", "对账工作流建立了一条由独立检查构成的身份链："],
  ["Clean primary reference.", "干净的主机参考。"],
  ["Exact primary", "精确主机"],
  ["publishes a compact, versioned behavior identity.", "发布紧凑、版本化的行为身份。"],
  ["Standby reproduction.", "备用机复现。"],
  ["A second machine independently reproduces that reference without receiving the candidate.", "第二台机器在未收到候选版本的情况下独立复现该参考。"],
  ["Development-base proof.", "开发基线证明。"],
  ["Development first proves that it can reproduce the same base and environment.", "开发机首先证明自己能复现同一基线与环境。"],
  ["Exact candidate.", "精确候选版本。"],
  ["One full candidate SHA runs in a separate clean worktree with frozen inputs and isolated output.", "一个完整候选 SHA 在独立的干净工作树中运行，输入被冻结，输出被隔离。"],
  ["Conditional server shadow.", "条件式服务器影子验证。"],
  ["Machine-sensitive scope adds a bounded check on the production-class machine without moving the live checkout.", "涉及机器环境的范围会在生产级机器上增加有界检查，同时不移动实时检出。"],
  ["Immutable review evidence.", "不可变审查证据。"],
  ["Ready-pull-request creation revalidates the result identity, decision, scope, and current head SHA.", "创建就绪拉取请求时，会重新验证结果身份、结论、范围和当前头部 SHA。"],
  ["A clean primary", "一台干净的主机"],
  ["projected a compact, versioned behavior identity rather than copying private logs or entire result trees. A standby machine independently reproduced that base. Development first proved it could reproduce the same base and then evaluated one exact candidate commit in a separate clean worktree with frozen inputs. The result named the candidate SHA, runtime identity, scope, decision, and deterministic evidence identity. If the candidate changed, the old result no longer matched and the ready-pull-request helper rejected it.", "投射的是紧凑、版本化的行为身份，而不是复制私有日志或整棵结果树。备用机独立复现该基线；开发机先证明能复现同一基线，再在独立的干净工作树中，以冻结输入评估一个精确候选提交。结果记录候选 SHA、运行时身份、范围、结论和确定性证据身份。一旦候选版本改变，旧结果便不再匹配，并会被就绪拉取请求辅助工具拒绝。"],
  ["Machine-sensitive work required an additional bounded server-shadow gate. It did not switch the live checkout to a topic branch. A short-lived approval fixed the allowed commands; a detached candidate worktree used the repository's pinned interpreter and an external results root; a lock and deadline bounded execution; and before-and-after digests checked that live state remained unchanged and cleanup completed. Raw logs stayed local rather than being treated as transferable proof. The final record carried only the bounded evidence needed for review.", "涉及机器环境的工作需要额外的有界服务器影子门控。它不会把实时检出切换到主题分支。一次短期批准固定允许执行的命令；分离的候选工作树使用仓库锁定的解释器和外部结果根目录；锁与截止时间约束执行；前后摘要检查实时状态保持不变且清理完成。原始日志留在本地，不被视为可转移证明。最终记录只携带审查所需的有界证据。"],
  ["This did not make every change equally expensive. Documentation-only and portable changes received an explicit classified result. Only work that could affect machine-specific runtime behavior required the separate shadow. The purpose of the workflow was not ceremony; it was to make the strength of evidence proportional to the risk of the change.", "这并未让每项改动付出同样成本。仅文档和可移植改动会得到明确分类结果；只有可能影响机器特定运行行为的工作才需要独立影子验证。工作流的目的不是仪式，而是让证据强度与改动风险相称。"],
  ["Learning that self-consistent evidence is not necessarily authentic", "认识到自洽证据未必真实"],
  ["The hardening system itself improved through review. At the end of July, one change exposed the need to represent an intentional, reviewed behavior difference truthfully rather than forcing it through an “everything must be identical” model. The next change bound the declared difference while keeping the interpreter, environment, commands, isolation, timeout, live state, and cleanup exact.", "加固系统本身也在审查中改进。7 月末，一项改动表明：有意且经过审查的行为差异，应被如实表达，而不是强行塞入“一切必须相同”的模型。下一项改动绑定了声明差异，同时保持解释器、环境、命令、隔离、超时、实时状态和清理精确一致。"],
  ["A later adversarial review found a deeper weakness. It constructed a record whose internal fields and self-hash were consistent but whose claimed Git lineage had been reidentified. Structural validation accepted it. The repair stopped trusting the record to authenticate its own history. Readiness instead reconstructed merge bases, path inventories, fingerprints, and lineage from trusted Git objects and compared those facts with the claim.", "之后的一次对抗性审查发现更深的弱点：它构造了一份内部字段和自身哈希一致、但声称的 Git 谱系已被重新标识的记录，结构验证仍然接受了它。修复后，系统不再信任记录自行认证其历史；就绪验证改为从可信 Git 对象重建合并基线、路径清单、指纹与谱系，再将这些事实与声明比较。"],
  ["That episode supplied one of the project's clearest technical lessons: a checksum can prove that a document is internally unchanged; it cannot by itself prove that the history described inside the document is true. Reproducibility is not merely repeating a command. It is establishing a verifiable line between the reviewed commit, its environment, its inputs, and the evidence used to evaluate it.", "这段经历带来了项目最清晰的技术经验之一：校验和可以证明文档内部未被更改，却不能单独证明文档所述历史真实。可复现性不只是重复一条命令，而是在被审查提交、其环境、输入与评估证据之间建立可验证的链路。"],
  ["launchd made Git state a production input", "launchd 让 Git 状态成为生产输入"],
  ["Once launchd could execute unattended work from the development clone, the checkout itself became a production input. If that clone were left on a topic branch, detached commit, or with local changes, an unattended launcher could execute candidate code and write non-authoritative output into the live presentation surface.", "当 launchd 能从开发克隆执行无人值守工作时，检出状态本身就成为生产输入。如果该克隆停留在主题分支、分离提交或带有本地改动，无人值守启动器就可能执行候选代码，并把非权威输出写入实时呈现界面。"],
  ["The scheduler preflight therefore fails closed. Before synchronization or execution, both scheduled launchers call one application-layer check. Only a checkout on branch", "因此，调度器预检采用失败关闭策略。同步或执行前，两个计划启动器都会调用同一项应用层检查。只有位于"],
  ["with no tracked or untracked changes passes. Topic, detached, dirty, unreadable, or non-repository states stop. The guard is inspect-only: it does not switch branches, clean files, stash work, reset history, fetch, or pull. A rejection attempts to append one bounded structured incident while preserving the existing live artifacts. Crucially, failure to write that diagnostic still does not grant permission to continue.", "分支且没有已跟踪或未跟踪改动的检出才能通过。主题分支、分离状态、脏状态、不可读状态或非仓库状态都会停止。防护只进行检查：不会切换分支、清理文件、暂存工作、重置历史、获取或拉取。拒绝时会尝试追加一条有界结构化事件，同时保留现有实时成果。关键在于，即使诊断写入失败，也不会因此获得继续执行的许可。"],
  ["Tests construct temporary Git repositories to cover clean", "测试会构造临时 Git 仓库，以覆盖干净的"],
  [", topic branches, detached HEAD, non-repositories, and dirty state. They also check that an accepted preflight leaves the checkout unchanged. This mechanism expresses the final production principle clearly:", "、主题分支、分离 HEAD、非仓库和脏状态。它们还会检查通过的预检不会改变检出。这一机制清楚表达了最终的生产原则："],
  ["maturity was no longer only the ability to run successfully; it was the ability to refuse execution when provenance was uncertain.", "成熟不再只是成功运行的能力，也是在来源不确定时拒绝执行的能力。"],
  ["By 4 August, AI-assisted work no longer began and ended with a prompt. The prompt supplied the goal; the repository supplied ownership and context; tests supplied behavioral evidence; reconciliation supplied identity and lineage; bounded production checks supplied operational evidence; and the human review decision remained explicit.", "到 8 月 4 日，AI 辅助工作已不再由一条提示词开始并结束。提示词提供目标；仓库提供职责归属与上下文；测试提供行为证据；对账提供身份与谱系；有界生产检查提供运行证据；人的审查决定始终明确保留。"],
  ["The repository grew large; its contracts grew faster", "仓库不断变大；契约增长得更快"],
  ["The chart below uses eight selected Git checkpoints from 4 January through the 4 August stopping point. These are physical line counts from tracked Git blobs. “Production source” excludes tests, data, configuration, lockfiles, and binaries. Markdown includes the README, agent rules, guides, architecture documents, plans, logs, and other written contracts. The points are milestones, not a claim of smooth daily growth.", "下图选取从 1 月 4 日到 8 月 4 日阶段性终点的八个 Git 检查点。数据是从 Git 跟踪对象中统计的物理行数。“生产源代码”不含测试、数据、配置、锁文件和二进制文件。Markdown 包括 README、代理规则、指南、架构文档、计划、日志及其他书面契约。这些点是里程碑，并不表示每天平滑增长。"],
  ["The important shape is the post-May divergence. From the", "重要的形态是 5 月后的分化。从"],
  ["expansion boundary to the later 9 August size audit, production source grew 39.6 percent, while tests grew 102.3 percent and Markdown grew 194.2 percent. The chart itself stops on 4 August, but the direction is already clear there: the refactor and hardening phases added much more verification and explicit context than product code.", "扩张边界到后来的 8 月 9 日规模审计，生产源代码增长 39.6%，测试增长 102.3%，Markdown 增长 194.2%。图表本身止于 8 月 4 日，但趋势已十分清楚：重构与加固阶段增加的验证和显式上下文，远多于产品代码。"],
  ["Tracked source, tests, and documentation", "跟踪的源代码、测试与文档"],
  ["Tracked source, tests, and documentation chart", "跟踪的源代码、测试与文档图表"],
  ["Tracked source, tests, and documentation data", "跟踪的源代码、测试与文档数据"],
  ["Checkpoint date", "检查点日期"],
  ["Physical lines", "物理行数"],
  ["Production source", "生产源代码"],
  ["Tests", "测试"],
  ["Engineering surface", "工程界面"],
  ["Checkpoint", "检查点"],
  ["Tracked files", "跟踪文件数"],
  ["Initial current-repository tree", "当前仓库初始目录树"],
  ["v0.1.0 unified product surface", "v0.1.0 统一产品界面"],
  ["v0.4.0 maintainability watershed", "v0.4.0 可维护性分水岭"],
  ["v0.8.0 governed-documentation stage", "v0.8.0 文档治理阶段"],
  ["v0.9.0 GitHub-centered hub", "v0.9.0 以 GitHub 为中心的枢纽"],
  ["v0.9.2 end of great expansion", "v0.9.2 大扩张终点"],
  ["PR #166 main refactor close", "PR #166 主要重构收尾"],
  ["PR #196 maintainability close", "PR #196 可维护性收尾"],
  ["The exact checkpoint table makes the comparison auditable. LOC is evidence of scale, not a quality score. The stronger conclusion is that a larger repository became less dependent on hidden knowledge because executable checks and written contracts grew around it.", "精确检查点表让比较可审计。LOC 是规模证据，而不是质量评分。更有力的结论是：随着可执行检查和书面契约在仓库周围成长，一个更大的仓库反而更少依赖隐性知识。"],
  ["Repository growth checkpoints", "仓库增长检查点"],
  ["Date", "日期"],
  ["Source LOC", "源代码行数"],
  ["Test LOC", "测试代码行数"],
  ["Markdown LOC", "Markdown 行数"],
  ["Why the repository remains closed source", "仓库为何保持闭源"],
  ["I intend to keep the repository closed source. Its strategy implementation supports live work and has produced real profit for me, so the source is not only personal code but commercially sensitive intellectual property. The disclosure boundary is deliberate: I can explain how the software is governed, tested, operated, and reviewed without publishing the signals, rules, parameters, instruments, positions, or deployable strategy code that create its economic value. That is why no strategy details are shown or included here.", "我打算让仓库继续保持闭源。其策略实现支撑真实运行，也为我产生过实际收益，因此源码不仅是个人代码，也是具有商业敏感性的知识产权。披露边界是有意设定的：我可以说明软件如何被治理、测试、运行和审查，而不公开创造其经济价值的信号、规则、参数、标的、头寸或可部署策略代码。这就是本文不展示也不包含任何策略细节的原因。"],
  ["The first table reproduces the owner-provided five-year evaluation summary at outcome level. Sharpe is unitless; CAGR, total return, and maximum drawdown are displayed as percentages; P05 and P95 are the reported fifth and ninety-fifth percentiles. The observation count and detailed evaluation protocol were not supplied for this article.", "第一张表在结果层面复现所有者提供的五年评估摘要。夏普比率没有单位；复合年增长率、总回报和最大回撤以百分比显示；P05 与 P95 是所报告的第 5 和第 95 百分位数。本文未获得观测数量和详细评估协议。"],
  ["Owner-provided aggregate performance disclosure", "所有者提供的汇总业绩披露"],
  ["Owner-provided five-year performance distribution", "所有者提供的五年业绩分布"],
  ["Owner-provided five-year performance summary", "所有者提供的五年业绩摘要"],
  ["Method", "方法"],
  ["Metric", "指标"],
  ["Mean", "均值"],
  ["Median", "中位数"],
  ["Portfolio", "组合"],
  ["Total return", "总回报"],
  ["Maximum drawdown", "最大回撤"],
  ["The separate ten-year result is the basis for describing the outcome as approximately ten times the starting capital in profit. A cumulative yield of", "单独的十年结果，是将成果描述为约赚取初始资本十倍利润的依据。累计收益率为"],
  ["percent represents profit equal to 10.2744 times the starting capital and an ending value of 11.2744 times the starting capital. These figures are owner-provided aggregate results, not independently audited calculations. Exact evaluation dates were not supplied, so the reported CAGR and cumulative yield are reproduced separately rather than treating one as a recomputation of the other. They describe historical performance, not guaranteed future returns or investment advice.", "%，表示利润相当于初始资本的 10.2744 倍，期末价值为初始资本的 11.2744 倍。这些数字是所有者提供的汇总结果，并非经独立审计的计算。由于未提供确切评估日期，所报告的复合年增长率与累计收益率被分别复现，而不把其中一项视为对另一项的重新计算。它们描述历史表现，不保证未来回报，也不构成投资建议。"],
  ["The separate ten-year result is the basis for describing the outcome as approximately ten times the starting capital in profit. A cumulative yield of 1,027.44 percent represents profit equal to 10.2744 times the starting capital and an ending value of 11.2744 times the starting capital. These figures are owner-provided aggregate results, not independently audited calculations. Exact evaluation dates were not supplied, so the reported CAGR and cumulative yield are reproduced separately rather than treating one as a recomputation of the other. They describe historical performance, not guaranteed future returns or investment advice.", "这份单独列示的十年期结果，是将成果描述为利润约为初始本金十倍的依据。1,027.44% 的累计收益率意味着利润相当于初始本金的 10.2744 倍，期末资产价值则为初始本金的 11.2744 倍。这些数据是由所有者提供的汇总结果，并非经独立审计的计算结果。由于未提供确切的评估日期，报告中的复合年增长率（CAGR）和累计收益率分别按原值呈现，而不将其中一项视为由另一项重新计算所得。它们描述的是历史表现，不构成对未来收益的保证，也不构成投资建议。"],
  ["Owner-provided ten-year result", "所有者提供的十年结果"],
  ["Owner-provided ten-year performance summary", "所有者提供的十年业绩摘要"],
  ["Name", "名称"],
  ["Yield", "收益率"],
  ["Strategy", "策略"],
  ["A curated engineering chronology", "精选工程历程"],
  ["The table below preserves the larger story without turning every event into an equal-weight chapter. It is deliberately curated rather than exhaustive. Early entries rely on public posts, archive structure, byte matches, and preserved timestamps; entries from January 2026 onward use Git commits, tags, and merged pull requests. The “why it mattered” column follows the article's argument: each friction point changed how I organized code, operated the product, or cooperated with AI.", "下表保留了更完整的故事，但没有把每个事件都变成同等分量的章节。它经过有意筛选，并非穷尽。早期条目依赖公开文章、存档结构、字节匹配和保留时间戳；2026 年 1 月之后的条目使用 Git 提交、标签和已合并拉取请求。“技术上为何重要”一栏延续本文论点：每一个摩擦点都改变了我组织代码、运营产品或与 AI 协作的方式。"],
  ["Engineering chronology", "工程历程"],
  ["Period", "时期"],
  ["Phase", "阶段"],
  ["Event", "事件"],
  ["Why it mattered technically", "技术上为何重要"],
  ["Evidence", "证据"],
  ["Learning workbench", "学习工作台"],
  ["Pure separation", "Pure 分离"],
  ["Productization", "产品化"],
  ["Product expansion", "产品扩张"],
  ["Shared context", "共享上下文"],
  ["Governed operation", "受治理的运行"],
  ["Governed expansion", "受治理的扩张"],
  ["Refactor boundary", "重构边界"],
  ["Urgent refactor", "紧急重构"],
  ["Refactor bridge", "重构桥接"],
  ["Production hardening", "生产加固"],
  ["First public Python-and-chart-backed analysis", "首次公开由 Python 与图表支撑的分析"],
  ["A question became a program, visible evidence, and a publishable explanation.", "一个问题变成程序、可见证据与可发布解释。"],
  ["Public page plus archived timestamps", "公开页面与存档时间戳"],
  ["First preserved bundled work product", "首个保留的成套工作成果"],
  ["Code, data, figures, and prose formed one manual deliverable.", "代码、数据、图像与文字组成一份人工交付物。"],
  ["Archived filesystem timestamp", "存档文件系统时间戳"],
  ["Rapid script and acquisition-automation expansion", "脚本与数据获取自动化快速扩张"],
  ["Capabilities grew faster than shared structure as repeated friction was solved locally.", "重复摩擦被局部解决，能力增长快于共享结构。"],
  ["Archived filesystem and source metadata", "存档文件系统与源码元数据"],
  ["Historical checking and validation limits became explicit", "历史检查与验证边界变得明确"],
  ["The practice widened from producing outputs to questioning how much those outputs established.", "实践从生产输出扩展到质问这些输出究竟能证明多少。"],
  ["Public page", "公开页面"],
  ["Selected programs were copied into a numbered series", "选定程序被复制为编号序列"],
  ["Code curation and separation began before Git was initialized.", "代码筛选与分离在 Git 初始化前就已开始。"],
  ["Byte-identical archive pairs and preserved timestamps", "逐字节相同的存档配对与保留时间戳"],
  ["Richer visual synthesis was published", "发布更丰富的视觉综合"],
  ["Communication became a first-class output of the work.", "表达成为工作的第一类成果。"],
  ["Git and the first ignore boundary appeared", "Git 与第一条忽略边界出现"],
  ["Source control explicitly separated code from bulky data and generated artifacts.", "版本控制明确分离代码、庞大数据与生成成果。"],
  ["Major consolidation, shared-configuration attempt, and QUA-6-MUL.py entered Git", "大规模整合、共享配置尝试，以及 QUA-6-MUL.py 进入 Git"],
  ["The series became more concentrated, while integration and review remained informal.", "程序序列更加集中，但集成与审查仍不正式。"],
  ["Date not recoverable", "日期无法恢复"],
  ["AI collaboration turning point", "AI 协作转折点"],
  ["Owner recalls an agent rewrite of QUA-6-MUL.py", "所有者回忆代理曾改写 QUA-6-MUL.py"],
  ["Recoverability, scope, and independent verification became design requirements.", "可恢复性、范围和独立验证成为设计要求。"],
  ["Owner recollection; archive does not prove the incident", "所有者回忆；存档不能证明该事件"],
  ["Current repository history began with 11 tracked files", "当前仓库历史从 11 个跟踪文件开始"],
  ["A small package, configuration, README, and main runner established the new tracked base.", "一个小型包、配置、README 与主运行器建立新的跟踪基线。"],
  ["Saved outputs, data updating, scheduling, and AGENTS.md arrived", "已保存输出、数据更新、调度与 AGENTS.md 加入"],
  ["Repeated operation became routine and AI work gained its first repository-local rules.", "重复运行成为常规，AI 工作首次获得仓库本地规则。"],
  ["The first unified release and family-facing web interface matured", "首个统一版本与面向家人的网页界面成熟"],
  ["Saved history and a multilingual GUI turned code into an operated private product.", "已保存历史与多语言图形界面将代码变成可运营的私有产品。"],
  ["CI, structured tests, snapshots, and standard checks arrived", "CI、结构化测试、快照与标准检查加入"],
  ["Completion began to require repeatable automated verification.", "完成开始要求可重复的自动验证。"],
  ["Evaluation, operational history, modular dashboard, macOS app, and a canonical result expanded the product", "评估、运行历史、模块化仪表盘、macOS 应用与规范结果扩展产品"],
  ["Usability and decomposition advanced together, with parity tests guarding shared behavior.", "可用性与拆分同步推进，由一致性测试守护共享行为。"],
  ["Guides, architecture map, canonical APIs, bootstrap, and DEVLOG appeared", "指南、架构图、规范 API、启动文档与 DEVLOG 出现"],
  ["Architectural memory became versioned and usable by future people and AI agents.", "架构记忆被版本化，可供未来的人与 AI 代理使用。"],
  ["25 results · Showing first 15", "共 25 条结果 · 显示前 15 条"],
  ["25 results", "共 25 条结果"],
  ["Page", "页码"],
  ["of", "/"],
  ["Previous page", "上一页"],
  ["Next page", "下一页"],
  ["Pure Git commits 32f92cc–38d6363", "Pure Git 提交 32f92cc–38d6363"],
  ["Pure Git commits c19a7de and e720ec7", "Pure Git 提交 c19a7de 与 e720ec7"],
  ["Annotated v0.1.0 and Git 329e6551–43332640", "带注释标签 v0.1.0 与 Git 329e6551–43332640"],
  ["Git daf148ea and annotated v0.4.0", "Git daf148ea 与带注释标签 v0.4.0"],
  ["Git ed71561f, 147c587d and annotated v0.8.0", "Git ed71561f、147c587d 与带注释标签 v0.8.0"],
  ["Git and PRs #7, #9, #11, #12", "Git 与 PR #7、#9、#11、#12"],
  ["Annotated v0.9.0 and Git 9f1ed730", "带注释标签 v0.9.0 与 Git 9f1ed730"],
  ["PRs #15–#16 and Git af5dcec5, 1ed9f72e, 4ae9255f, e8c4d778", "PR #15–#16 与 Git af5dcec5、1ed9f72e、4ae9255f、e8c4d778"],
  ["PRs #17–#46", "PR #17–#46"],
  ["Annotated v0.9.2", "带注释标签 v0.9.2"],
  ["PRs #47–#111", "PR #47–#111"],
  ["Selected PRs #112–#166", "精选 PR #112–#166"],
  ["PRs #167–#171", "PR #167–#171"],
  ["PRs #172–#186; one unmerged experiment excluded", "PR #172–#186；排除一项未合并实验"],
  ["PRs #187–#196", "PR #187–#196"],
  ["Each control closed a failure the previous one left open", "每项控制都补上前一项留下的缺口"],
  ["The project is a technical record, but its stronger result is a change in how I reason about software and AI.", "这个项目是一份技术记录，但更重要的成果，是它改变了我思考软件与 AI 的方式。"],
  ["Git could recover a damaging edit, but it could not tell an agent where behavior belonged. Guides, maps, invariants, and local sidecars made ownership legible, but written rules alone could not guarantee that the right workflow was followed.", "Git 能恢复破坏性编辑，却无法告诉代理行为应归属何处。指南、架构图、不变量和本地伴随文档让职责清晰可读，但书面规则本身无法保证正确工作流得到执行。"],
  ["converted those rules into repeatable verification and review protocols, but ordinary test output could still become detached from a moving candidate. Reconciliation bound evidence to exact code, while fail-closed launchd checks kept unattended operation inside the same trust boundary.", "将这些规则转化为可重复的验证与审查协议，但普通测试输出仍可能与不断移动的候选版本脱节。对账把证据绑定到精确代码，而失败关闭的 launchd 检查则让无人值守运行停留在同一信任边界内。"],
  ["The product followed the same pattern. The GUI made the system usable by someone without terminal context, but it also exposed coupling. The application layer prevented the dashboard from becoming a second implementation. launchd removed dependence on manual timing, but it also made machine authority and checkout state operational concerns. Synchronization roles, versioned snapshots, external live-state ownership, and preflight guards turned those risks into explicit contracts.", "产品也遵循同一模式。图形界面让缺乏终端背景的人可以使用系统，也暴露了耦合。应用层阻止仪表盘变成第二套实现。launchd 消除了对人工定时的依赖，却也让机器权限与检出状态成为运行问题。同步角色、版本化快照、外部实时状态职责和预检防护，将这些风险转化为明确契约。"],
  ["I moved from asking AI to produce outputs to designing an environment in which AI-assisted changes were legible, reversible, bounded, and evidence-backed. The prompt remained a creative interface; the repository became the safety interface.", "我从要求 AI 生产输出，转向设计一个让 AI 辅助改动清晰、可逆、有界且有证据支撑的环境。提示词仍是创意接口，仓库则成为安全接口。"],
  ["That is why this article ends on 4 August 2026. Stopping was itself an engineering decision: urgent ownership risks had been reduced, production boundaries had been hardened, and further cleanup no longer justified destabilizing working behavior. Nonurgent simplification, clearer naming, smaller functions, and easier reading remain possible, but they can proceed gradually when evidence supports them.", "这就是本文止于 2026 年 8 月 4 日的原因。停止本身也是工程决策：紧急职责风险已经降低，生产边界已经加固，进一步清理已不足以证明扰动正常行为的合理性。非紧急的简化、更清晰的命名、更小的函数和更易读的代码仍然可以继续，但应在证据支持时逐步进行。"],
  ["The repository grew from scripts into a system. My deeper growth was learning not only how to add structure, but how to choose the control that answered the current failure—and how to recognize when the urgent work was complete.", "仓库从脚本成长为系统。我更深层的成长，不只是学会增加结构，也在于学会选择能够回应当前失效的控制，并判断紧急工作何时已经完成。"],
  ["Evidence boundaries and limitations", "证据边界与局限"],
  ["The public site provides reliable publication dates and a visible sequence of results, but it is not source-control history. GPT-4 and the approximate 2024 beginning are my recollection.", "公开网站提供可靠的发布日期和可见成果顺序，但它不是版本控制历史。GPT-4 与大约始于 2024 年属于我的回忆。"],
  ["The early", "早期的"],
  ["folder has no Git repository. Its dates are preserved filesystem clues from an archive, not proof of exact authorship or creation order.", "文件夹没有 Git 仓库。其日期只是存档保留的文件系统线索，并不能证明确切作者或创建顺序。"],
  ["has six commits and direct extraction evidence, but its history begins after some of its code existed. The archive can place", "有六个提交和直接提取证据，但它的历史开始时，部分代码已先存在。存档可以把"],
  ["in the Git chronology; it cannot independently prove the reported rewrite incident.", "放入 Git 时间线，却无法独立证明所述改写事件。"],
  ["The current repository provides strong commit, tag, and pull-request evidence from January onward. Even there, Git proves when a capability entered this repository, not when inherited logic was first written. Runtime and market data were deliberately left untouched during this reconstruction. The closed-source chapter reproduces owner-provided aggregate figures without rerunning the strategy, inspecting private positions, or reviewing brokerage statements; it is not an independent performance audit.", "当前仓库从 1 月起提供了有力的提交、标签和拉取请求证据。即使如此，Git 证明的也是某项能力何时进入此仓库，而不是继承逻辑最初何时写成。本次重建有意不触碰运行数据和市场数据。闭源章节复现所有者提供的汇总数字，没有重新运行策略、查看私有头寸或审阅券商报表；它不是独立业绩审计。"],
  ["Those limits do not weaken the account. They distinguish what the repositories prove, what the archives preserve, and what I remember.", "这些局限没有削弱叙述，反而区分了仓库能够证明什么、存档保留了什么，以及我记得什么。"],
  ["Sources", "来源"],
  ["Personal finance-page review", "个人金融页面审阅"],
  ["OldFinance/fInAnce archive inventory", "OldFinance/fInAnce 存档清单"],
  ["OldFinance/Pure archive and Git inventory", "OldFinance/Pure 存档与 Git 清单"],
  ["Current fInAnce Git-history and growth audit", "当前 fInAnce Git 历史与增长审计"],
  ["Curated engineering event ledger", "精选工程事件台账"],
  ["Owner clarifications for version two", "所有者对第二版的澄清"],
  ["Engineering control map", "工程控制图"],
  ["SQL query", "SQL 查询"],
  ["Git checkpoint growth chart query", "Git 检查点增长图查询"],
  ["Git checkpoint exact-value query", "Git 检查点精确值查询"],
  ["Consolidated engineering chronology query", "综合工程历程查询"],
  ["Chapter navigation", "章节导航"],
  ["Article navigation", "文章导航"],
  ["Loading journal", "正在加载日志"],
  ["and", "与"],
  [", and", "，以及"],
  ["make and just", "make 与 just"],
  ["The first", "第一份"],
  ["Jan 4", "1 月 4 日"],
  ["Jan 12", "1 月 12 日"],
  ["Jan 30", "1 月 30 日"],
  ["Feb 23", "2 月 23 日"],
  ["Mar 21", "3 月 21 日"],
  ["May 21", "5 月 21 日"],
  ["Jul 15", "7 月 15 日"],
  ["Aug 4", "8 月 4 日"],
  ["Application ownership, technical debt, invariants, discipline checks, environment, and device roles became explicit", "应用职责、技术债、不变量、纪律检查、环境与设备角色得到明确"],
  ["Responsibilities and must-preserve behavior stopped depending on tacit memory.", "职责与必须保留的行为不再依赖隐性记忆。"],
  ["GitHub-centered multi-device hub and Codex traceability stabilized", "以 GitHub 为中心的多设备枢纽与 Codex 可追溯性趋于稳定"],
  ["Tasks, branches, commits, pull requests, and machines gained declared roles.", "任务、分支、提交、拉取请求与机器都获得声明的角色。"],
  ["Reusable foundations, test-first policy, roadmap, implementation queue, make, and just formalized development", "可复用基础、测试优先政策、路线图、实施队列、make 与 just 让开发正式化"],
  ["Feature work became ordered, reviewable, and executable through repeatable project commands.", "功能工作变得有序、可审查，并可通过重复项目命令执行。"],
  ["Saved evidence, comparisons, serial workflows, visual output, and GUI integration broadened the product", "已保存证据、比较、串行工作流、视觉输出与图形界面集成拓宽产品"],
  ["Capabilities became durable and available across multiple user-facing surfaces.", "能力变得持久，并可用于多个面向用户的界面。"],
  ["v0.9.2 declared the end of great expansion", "v0.9.2 宣告大扩张结束"],
  ["Repository direction changed from feature addition to reduction-first ownership work.", "仓库方向从增加功能转向以精简为先的职责工作。"],
  ["Supported surfaces were guarded and large modules began transferring responsibilities", "受支持界面获得保护，大型模块开始转移职责"],
  ["Snapshots, persistence, result locations, logs, state, timing, accounting, and components gained explicit contracts or owners.", "快照、持久化、结果位置、日志、状态、时序、记账与组件获得明确契约或职责方。"],
  ["Composition, reporting, plotting, compatibility wrappers, and orchestration were decomposed", "组合、报告、绘图、兼容包装与编排被拆分"],
  ["Narrow tested ownership transfers replaced the risk of a wholesale rewrite; PR #166 closed the main refactor.", "窄范围且经过测试的职责转移，取代整体重写的风险；PR #166 结束主要重构。"],
  ["Observable evidence surfaces were added without changing live adoption", "在不改变实时采用状态的前提下增加可观测证据界面"],
  ["The newly decomposed system could expose bounded evidence while production behavior remained unchanged.", "新拆分的系统能够暴露有界证据，同时保持生产行为不变。"],
  ["Exact environment, multi-machine reconciliation, exact-head PR evidence, server shadow, incident records, and fail-closed preflight arrived", "精确环境、多机对账、精确头部 PR 证据、服务器影子、事件记录与失败关闭预检加入"],
  ["Verification became bound to the exact candidate, machine role, and trusted execution context.", "验证被绑定到精确候选版本、机器角色与可信执行上下文。"],
  ["Product boundaries and completed-result owners were clarified; measured closeout stopped speculative deletion", "产品边界与完成结果职责得到明确；量化收尾停止推测性删除"],
  ["Urgent hardening ended when evidence no longer justified further compatibility cleanup.", "当证据不再支持进一步兼容清理时，紧急加固结束。"],
  ["Returns the reviewed failure-to-control mappings used by the report's introductory engineering-control table.", "返回经审阅的“失效到控制”映射，供报告引言中的工程控制表使用。"],
  ["Reshapes the reviewed Git checkpoint counts into one row per engineering surface for the report chart.", "将经审阅的 Git 检查点计数重塑为每个工程界面一行，供报告图表使用。"],
  ["Returns the reviewed Git checkpoint counts used in the exact-value table.", "返回精确值表所用的经审阅 Git 检查点计数。"],
  ["Returns the owner-provided five-year metric distribution exactly as approved for public disclosure, with raw rates and reader-facing display values.", "严格按批准公开披露的形式返回所有者提供的五年指标分布，包括原始比率与面向读者的显示值。"],
  ["Returns the separately reported ten-year CAGR, maximum drawdown, and cumulative yield without recomputing one measure from another.", "返回分别报告的十年复合年增长率、最大回撤与累计收益率，不以某一指标重新计算另一指标。"],
  ["Returns the reviewed public-site, archive, and Git event ledger in editorial order.", "按编辑顺序返回经审阅的公开网站、存档与 Git 事件台账。"],
  ["Eight Git checkpoints, 4 January–4 August 2026; physical lines, with data, configuration, lockfiles, and binaries excluded.", "八个 Git 检查点，时间为 2026 年 1 月 4 日至 8 月 4 日；统计物理行数，不含数据、配置、锁文件与二进制文件。"],
  ["How did production source, automated tests, and Markdown documentation grow across the current repository's major engineering checkpoints?", "在当前仓库的主要工程检查点之间，生产源代码、自动化测试与 Markdown 文档如何增长？"],
  ["A multi-series line chart shows the ordered growth paths and the post-May acceleration of tests and written contracts; the adjacent table preserves exact values.", "多序列折线图展示有序的增长路径，以及 5 月后测试与书面契约的加速；相邻表格保留精确数值。"],
  ["Initial current-repository tree on 2026-01-04", "2026 年 1 月 4 日的当前仓库初始目录树"],
  ["Eight selected Git checkpoints", "八个选定的 Git 检查点"],
  ["Physical line counts from tracked Git blobs", "从 Git 跟踪对象统计的物理行数"],
  ["Engineering surface growth", "工程界面增长"],
  ["physical lines", "物理行数"],
  ["lines", "行"],
  ["Line style", "线条样式"],
  ["Six engineering responses to the failures exposed by AI collaboration, product operation, and production review.", "针对 AI 协作、产品运行与生产审查所暴露问题的六项工程回应。"],
  ["Tracked Git blobs from 4 January to the 4 August 2026 stopping point; physical LOC, excluding tests from source and excluding data, configuration, lockfiles, and binaries.", "从 1 月 4 日到 2026 年 8 月 4 日阶段性终点的 Git 跟踪对象；统计物理代码行，源代码不含测试，并排除数据、配置、锁文件与二进制文件。"],
  ["Portfolio summary across the supplied five-year evaluation windows; return and drawdown metrics are percentages, Sharpe is unitless, and sample count was not supplied.", "所提供五年评估窗口的组合摘要；回报与回撤指标以百分比表示，夏普比率无单位，样本数量未提供。"],
  ["Historical aggregate reproduced as supplied; exact evaluation dates were not provided, so CAGR and cumulative yield are reported independently.", "按所提供内容复现历史汇总结果；由于未提供确切评估日期，复合年增长率与累计收益率分别报告。"],
  ["Curated public posts and archive evidence for 2024–2025; Git commits, tags, and pull requests through 4 August 2026.", "精选 2024—2025 年公开文章与存档证据；以及截至 2026 年 8 月 4 日的 Git 提交、标签和拉取请求。"],
]);

const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const translatedAttributes = ["title", "aria-label", "alt"];

function normalized(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function translateDynamic(value) {
  const text = normalized(value);
  if (translations.has(text)) return translations.get(text);
  if (text.startsWith("Last updated ")) {
    const date = text.slice(13);
    return `最后更新：${translations.get(date) || date}`;
  }
  if (text === "Report blocks") return "报告内容";
  if (text.startsWith("Open options for ")) {
    const subject = text.slice(17);
    const translatedSubject = translations.get(subject)
      || (subject.length > 80 ? "此段内容" : subject);
    return `打开“${translatedSubject}”的选项`;
  }
  if (text === "Edit markdown for markdown") return "编辑 Markdown";
  if (text.startsWith("Edit markdown header for ")) {
    const subject = text.slice(25);
    return `编辑“${translations.get(subject) || subject}”标题`;
  }
  if (text.startsWith("Scrollable table: ")) {
    const subject = text.slice(18);
    return `可滚动表格：${translations.get(subject) || subject}`;
  }
  if (text.startsWith("Source for ")) {
    const subject = text.slice(11);
    const translatedSubject = translations.get(subject)
      || (subject.length > 80 ? "此段内容" : subject);
    return `${translatedSubject}的来源`;
  }
  if (text.startsWith("Source: ")) {
    const source = text.slice(8);
    return `来源：${translations.get(source) || source}`;
  }
  if (text.startsWith("Tables: ")) return `数据表：${text.slice(8)}`;
  if (text.startsWith("Table: ")) return `数据表：${text.slice(7)}`;
  if (text.startsWith("File: ")) return `文件：${text.slice(6)}`;
  const lineCount = text.match(/^([\d.]+K?)lines$/);
  if (lineCount) return `${lineCount[1]} 行`;
  return null;
}

function shouldSkip(node) {
  return Boolean(node.parentElement?.closest("script, style, template, pre, code, [data-i18n-skip]"));
}

function applyText(node, language) {
  if (shouldSkip(node)) return;
  const current = node.nodeValue || "";
  if (!originalText.has(node)) {
    if (!translateDynamic(current)) return;
    originalText.set(node, current);
  }
  const source = originalText.get(node);
  if (language === "en") {
    if (node.nodeValue !== source) node.nodeValue = source;
    return;
  }
  const output = translateDynamic(source);
  if (!output) return;
  const leading = source.match(/^\s*/)?.[0] || "";
  const trailing = source.match(/\s*$/)?.[0] || "";
  const target = `${leading}${output}${trailing}`;
  if (node.nodeValue !== target) node.nodeValue = target;
}

function applyAttribute(element, attribute, language) {
  const current = element.getAttribute(attribute);
  if (!current) return;
  let values = originalAttributes.get(element);
  if (!values) {
    values = new Map();
    originalAttributes.set(element, values);
  }
  if (!values.has(attribute)) {
    if (!translateDynamic(current)) return;
    values.set(attribute, current);
  }
  const source = values.get(attribute);
  const target = language === "zh" ? translateDynamic(source) : source;
  if (element.getAttribute(attribute) !== target) element.setAttribute(attribute, target);
}

function applyRoot(root, language) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) applyText(root, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    applyText(node, language);
    node = walker.nextNode();
  }
  if (root instanceof Element) {
    for (const attribute of translatedAttributes) {
      if (root.hasAttribute(attribute)) applyAttribute(root, attribute, language);
    }
  }
  root.querySelectorAll?.("[title], [aria-label], [alt]").forEach((element) => {
    translatedAttributes.forEach((attribute) => {
      if (element.hasAttribute(attribute)) applyAttribute(element, attribute, language);
    });
  });
}

function currentLanguage() {
  return document.documentElement.dataset.language === "zh" ? "zh" : "en";
}

function applyLanguage(language = currentLanguage()) {
  applyRoot(document.body, language);
  const title = "From Scripts to a System: How a Quant Project Changed the Way I Build with AI";
  document.title = language === "zh" ? translations.get(title) : title;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = language === "zh"
      ? translations.get("A first-person software-engineering history of learning to build a governed private product in cooperation with AI.")
      : "A first-person software-engineering history of learning to build a governed private product in cooperation with AI.";
  }
}

document.addEventListener("fz:languagechange", (event) => {
  applyLanguage(event.detail?.language === "zh" ? "zh" : "en");
});

if (document.body) {
  new MutationObserver((mutations) => {
    const language = currentLanguage();
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => applyRoot(node, language));
      if (mutation.type === "characterData") applyText(mutation.target, language);
      if (mutation.type === "attributes" && mutation.target instanceof Element) {
        applyAttribute(mutation.target, mutation.attributeName, language);
      }
    });
  }).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: translatedAttributes,
  });
}

applyLanguage();

window.addEventListener("storage", (event) => {
  if (event.key !== LANGUAGE_KEY || !event.newValue) return;
  requestAnimationFrame(() => applyLanguage(event.newValue === "zh" ? "zh" : "en"));
});
