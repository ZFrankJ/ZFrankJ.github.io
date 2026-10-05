(() => {
  const fx = Object.freeze({
    date: "2026-09-30",
    usdCny: 6.7351,
    source: "https://www.chinamoney.com.cn/english/bmkcpr/index.html?tab=2",
  });
  const earningsThresholdCny = 10000 * fx.usdCny;
  const earningsWan = Math.round(earningsThresholdCny / 10000);

  const stories = {
    "story:intro": "## 引言\n\n我的量化项目起步于一些小脚本，以及可以用一次比较来表达的问题。阀值是一个容易上手的起点：把收盘价与某个固定的绝对价格比较。随着项目发展，我关注的问题也发生了变化：不再只看价格处于绝对尺度上的哪个位置，而是看它相对于不断变化的局部背景处于什么位置。\n\n第一阶段使用原始价格单位下的**收盘价概率密度函数（PDF）**。第二阶段将有符号的局部偏离表示为**标准差的倍数**，构建三维状态空间。",
    "threshold:body": "## 阀值阶段：PDF 描述的是价格分布\n\n早期流程把描述性的价格分析与固定价位比较结合起来。密度分析程序会**加载收盘价、选取历史样本、估计高斯核密度，并找出密度峰值**。另一个比较过程则使用固定的价格阀值。两者作用不同：密度描述样本，阀值划定边界。\n\n### PDF 描述什么\n\n这里的密度对应**价格本身**，不是收益率或百分比变化。高斯核将每个观测价格展开为一个平滑的小贡献；把这些贡献叠加起来，就能看出所选样本中的价格集中在哪里。曲线最高点是估计的众数，不是预测，也不能自动成为合理的决策边界。\n\n### 读懂价格分布\n\n图中使用了存档样本中的 **1,212 个收盘价观测**，样本止于最后一条记录，并在 **1,000 个网格点**上计算密度。价格保留原始单位，横轴覆盖样本的最低价到最高价。",
    "threshold:lesson": "### 从分布走向变化的背景\n\n把数据准备、模拟和描述性价格分析分开后，它们各自的作用更加清楚：分布概括观测，阀值划定边界，模拟评估有序序列中的行为。它们彼此相关，但不是同一种计算。\n\n价格 PDF 让集中程度变得可见，但汇总价格会丢失它们的先后顺序。当局部中心或波动程度发生变化时，一个经常出现的价格未必仍是稳定的参考；多个集中区域也可能把不同阶段混合进同一条静态曲线。\n\n回看这一步，概念上的局限很清楚：**固定价格问的是我在绝对尺度上的位置；标准差单位下的偏离问的是我相对于变化背景的位置**。",
    "std:body": "## 标准差阶段：从价位走向变化的状态\n\n用标准差衡量偏离时，需要两项局部背景：中心 μ 和样本标准差 s。减去中心得到偏离，再除以 s，就把偏离转化为可比较的波动单位。零表示观测恰好位于对应的局部中心；正负值表示它位于中心的两侧。\n\n对于背景 k，设 Hₖ(t) 包含 nₖ(t) 个参考观测 qₖ,ᵢ。每个背景的中心与尺度都与当前观测 xₜ 对齐。这里使用的**样本方差分母是 n − 1**，不是总体方差的分母 n。计算至少需要两个参考观测，以及一个有限、为正的尺度。",
    "std:vector": "下一步，是不再把一个坐标当作全部状态。使用三个不同的观察周期，可以得到由慢速、中速和快速背景偏离组成的向量。同一个观测可能靠近一个局部中心，却远离另一个中心。这种分歧本身就是状态的一部分，不是应该取平均消除的误差。\n\n图中包含 **1,601 个观测**，每个观测都有三个标准差偏离坐标和一个**后续 20 个交易观测的价格收益率**。",
    "std:return-definition": "这里的 **20 日**指后续 20 个交易观测，不是 20 个自然日。颜色是用之后的价格计算的**事后标签**，不是 t 时刻已经掌握的信息，也不是预测。它衡量的是简单价格变化，不是扣除手续费和执行成本后的策略收益。",
    "std:figure-heading": "",
    "std:caption": "**在图内拖动即可旋转**，也可以使用方向键，或选择两两坐标视图。悬停或选中一个点，可以查看它的坐标和**后续 20 个交易观测的收益率**。旋转时 Viridis 色标保持固定；图例和提示框都以百分比显示收益率。\n\n点云展示的是观测，不是拟合曲面。",
    "std:patterns": "### 读懂点云形状\n\n点云呈长条形，而不是球形。它的厚度和偏离主轴的观测都很重要，因为一个标量无法保留不同观察周期之间的所有差异。三个坐标往往一起变化，但不能互相替代：在这个样本中，慢速与中速的相关系数约为 0.82，中速与快速约为 0.63，慢速与快速约为 0.47。\n\n这些关系描述了样本，但不能据此证明预测能力、因果关系，或一个能够盈利的决策边界。",
    "story:reflection": "## 我的思考方式发生了什么变化\n\n重要的转变是**绝对价格分析 → 相对背景的偏离 → 多周期状态**。价格 PDF 和固定价位比较让第一阶段有了具体形式；用标准差衡量偏离改变了坐标系，三维视图则让不同周期之间的一致与分歧能够被观察。\n\n这也改变了我与代码和 AI 协作的方式。一句“改进方法”可能包含几种不同任务：修改公式、检查分布、生成图像，或改变执行行为。随着项目成熟，我开始更明确地说明自己要做哪件事，以及哪些输出必须保持不变。工程历程中提到的意外改写之后，这种区分尤其重要：看起来更整洁的实现，也可能改变方法本身。\n\n我的体会不是表示方式越复杂就越好，而是：只有能够解释**这种表示保留了什么、舍弃了什么，以及现有证据还不能说明什么**，开发才会变得更严谨。",
    "story:evidence": `## 当前方法\n\n我用当前方法实盘交易，已经赚到了**超过 ${earningsWan} 万元人民币**。因此，我将仓库保持为**闭源**，并从图表数据中移除 ETF 代码、名称和私人信息。\n\n两幅图展示不同的表示方式，使用的样本也不同；它们不是对齐后的绩效比较，也不是这些实盘盈利的证据。密度峰值不是实际采用的交易阀值，标准差偏离点云的收益颜色也不是交易信号，更不能证明未来一定盈利。\n\n图表数据可在下方下载，其中不包含 ETF 代码与名称、逐条日期、私有参考周期、阀值、持仓和执行规则。\n\n核密度的说明参考了 [SciPy 文档](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.gaussian_kde.html)。这些图仅用于描述性说明，不构成投资建议。`,
  };

  const labels = new Map([
    ["From a Threshold to STD: Finding Patterns in Data", "从阀值到标准差：寻找数据规律"],
    ["How I learned to find patterns in data, from fixed price thresholds to a three-dimensional STD state.", "从固定价格阀值到三维标准差偏离状态，记录我如何从数据中寻找规律。"],
    ["Method development", "方法开发"], ["Intro", "引言"],
    ["The threshold stage", "阀值阶段"], ["The STD stage", "标准差阶段"],
    ["What changed in my thinking", "思考方式的变化"], ["The current method", "当前方法"],
    ["Chapters", "章节"], ["Article navigation", "文章导航"],
    ["Chapter navigation", "章节导航"], ["Return links", "返回导航"],
    ["Figure data", "图表数据"],
    ["Closing-price sample · CSV ↗", "收盘价样本 · CSV ↗"],
    ["Price-density grid · CSV ↗", "价格密度网格 · CSV ↗"],
    ["STD cloud & return labels · CSV ↗", "标准差偏离点云与收益标签 · CSV ↗"],
    ["Figure 1 · The historical closing-price PDF", "图 1 · 历史收盘价概率密度"],
    ["Figure 2 · The three-dimensional STD state space", "图 2 · 三维标准差偏离状态空间"],
    ["Reading the shape", "读懂点云形状"], ["Closing price", "收盘价"],
    ["Probability density / price unit", "概率密度 / 价格单位"],
    ["1,000 density-grid points reconstructed from 1,212 archived closing prices in original price units. The global density peak is marked, not an adopted cutoff or instrument label.", "从 1,212 个存档收盘价重建的 1,000 个密度网格点，保留原始价格单位。标记的是全局密度峰值，不是实际采用的阀值或ETF 代码或名称。"],
    ["Slow-, medium-, and fast-context deviations, colored by 20-day forward price return. Drag to rotate; hover or select a point to inspect it.", "慢速、中速和快速背景下的偏离，以后续 20 个交易观测的价格收益率着色。拖动可旋转；悬停或选中可查看具体观测。"],
    ["pᵢ is an observed closing price; K integrates to one, and b is the automatically selected smoothing bandwidth. The source searches a finite grid, so the displayed mode approximates the continuous maximum. The endpoints a, c and threshold θ are symbolic; no adopted threshold is disclosed.", "pᵢ 表示观测收盘价；K 的积分为 1，b 是自动选择的平滑带宽。程序在有限网格上搜索，因此图示众数是连续最大值的近似。端点 a、c 和阀值 θ 都是符号表示；这里不披露实际采用的阀值。"],
    ["A symbolic price partition, not a disclosed decision rule", "符号化的价格划分，不是公开的决策规则"],
    ["Gaussian kernel, price density, grid mode and interval probability", "高斯核、价格密度、网格众数与区间概率"],
    ["Local center, sample standard deviation and signed deviation", "局部中心、样本标准差与有符号偏离"],
    ["Three-dimensional STD state vector", "三维标准差偏离状态向量"],
    ["Retrospective simple price return over 20 trading observations", "后续 20 个交易观测的事后简单价格收益率"],
    ["LaTeX source", "LaTeX 源码"], ["State-space views", "状态空间视图"],
    ["3D / Reset", "三维 / 重置"], ["Slow–medium", "慢速–中速"],
    ["Slow–fast", "慢速–快速"], ["Medium–fast", "中速–快速"],
    ["Slow STD", "慢速标准差偏离"], ["Medium STD", "中速标准差偏离"], ["Fast STD", "快速标准差偏离"],
    ["Slow", "慢速"], ["Medium", "中速"], ["Fast", "快速"],
    [": slow", "：慢速"], [", medium", "，中速"], [", fast", "，快速"],
    ["; Forward return (20-day)", "；后续 20 个交易观测收益率"],
    ["· Medium", "· 中速"], ["· Fast", "· 快速"],
    ["20-day return", "后续 20 个交易观测收益率"],
    ["20-day forward price return", "后续 20 个交易观测价格收益率"],
    ["Original Viridis palette · Fixed observed return range", "原始 Viridis 配色 · 固定样本收益范围"],
    ["Inspect a point", "查看观测点"], ["Choose a point", "选择观测点"],
    ["Hover or select a point to inspect its coordinates and return.", "悬停或选中一个点，查看它的坐标与收益率。"],
    ["Drag or use arrow keys to rotate ·", "拖动或使用方向键旋转 ·"],
    ["observations", "个观测"],
    ["Interactive STD state space from the exact repository command", "由仓库原有命令生成的交互式标准差偏离状态空间"],
    ["Drag or use arrow keys to rotate the camera. Select a point to inspect its unchanged coordinates and retrospective return. The return color scale is fixed while rotating. No financial calculation is rerun.", "拖动或使用方向键旋转视角。选中一个点可查看其原始坐标与事后收益率。旋转时收益色标保持固定，不会重新运行金融计算。"],
    ["Source", "来源"], ["Sources", "来源"], ["View source", "查看来源"],
    ["Show source", "显示来源"], ["Source details", "来源详情"],
    ["Source information", "来源信息"], ["Copy", "复制"], ["Copied", "已复制"],
    ["Copy data", "复制数据"], ["Copy CSV", "复制 CSV"],
    ["Download CSV", "下载 CSV"], ["Export CSV", "导出 CSV"],
    ["Copy source", "复制来源"], ["Copy source link", "复制来源链接"],
    ["Close", "关闭"], ["Options", "选项"], ["Data", "数据"],
    ["Table", "表格"], ["Tables", "数据表"], ["Chart", "图表"],
    ["Rows", "行"], ["Columns", "列"], ["Query", "查询"],
    ["Metric definitions", "指标定义"], ["Definition", "定义"],
    ["Definitions", "定义"], ["Overview", "概览"], ["Data preview", "数据预览"],
    ["SQL query", "SQL 查询"], ["Data source sections", "数据来源分区"],
    ["Reporting period", "统计区间"], ["Query executed", "查询执行时间"],
    ["Source captured", "来源记录时间"], ["Assumptions and caveats", "假设与限制"],
    ["Provided metric definitions", "提供的指标定义"], ["Current component filters", "当前图表筛选条件"],
    ["Search", "搜索"], ["Search rows", "搜索数据行"],
    ["Previous page", "上一页"], ["Next page", "下一页"],
    ["First page", "首页"], ["Last page", "末页"],
    ["No data", "暂无数据"], ["No rows", "暂无数据行"],
    ["Source details weren’t recorded for this block.", "此内容未记录来源详情。"],
    ["Method", "方法"], ["Methods", "方法"], ["Files", "文件"],
    ["Filters", "筛选条件"], ["Evidence flow", "证据流程"],
    ["Source trace", "来源追溯"], ["Source code", "源代码"],
    ["Report blocks", "报告内容"], ["SQL data", "SQL 数据"],
    ["Oct 4, 2026", "2026 年 10 月 4 日"], ["October 4, 2026", "2026 年 10 月 4 日"],
    ["Archived closing-price PDF reconstruction", "存档收盘价概率密度的重建"],
    ["Frozen historical price sample, not a live quote or a return distribution", "固定的历史价格样本，不是实时报价或收益率分布"],
    ["Estimated price density", "估计的价格密度"], ["Displayed support", "图示价格范围"],
    ["Reconstructed sample", "重建样本"], ["Read-only source trace", "只读来源追溯"],
    ["Frozen reconstruction", "固定条件下的重建"], ["Independent public data", "独立的公开数据"],
    ["De-identified export of the owner's repository Analysis command", "仓库 Analysis 命令的脱敏导出"],
    ["Start date 2020-01-01 applied by the original CLI before calculation", "原有命令行在计算前应用 2020-01-01 的起始日期"],
    ["No posthoc filtering or private strategy overlay", "没有事后筛选或私有策略叠加"],
    ["STD coordinate", "标准差偏离坐标"], ["Slow, medium, fast", "慢速、中速、快速"],
    ["Exact command output, transported", "原有命令输出的完整转移"], ["Interactive camera only", "仅交互改变视角"],
    ["An observed archived closing-price level, copied directly without normalization. Instrument identity and per-observation timestamps are withheld.", "直接复制的存档收盘价，未作标准化。ETF 代码与名称与逐条观测时间均不公开。"],
    ["Gaussian KDE using the archived analyzer's default bandwidth procedure. Density is per unit of price, not a return, forecast, or probability at a single point.", "使用存档分析程序默认带宽方法的高斯核密度估计。密度以每单位价格计量，不是收益率、预测，也不是单个点的概率。"],
    ["1,000 grid points span the selected sample's observed price minimum and maximum. The curve area on this displayed interval is approximately 0.990; the remaining Gaussian tails are outside it. Heights were not renormalized.", "1,000 个网格点覆盖所选样本的最低价到最高价。图示区间内的曲线面积约为 0.990，其余高斯尾部位于区间之外。密度高度未重新归一化。"],
    ["1,212 closing-price observations selected from the CSV explicitly referenced by the legacy analyzer. The analyzer's wall-clock lookback is frozen at the last saved observation; the exact original run date is unknown.", "从旧分析程序明确引用的 CSV 中选出 1,212 个收盘价观测。程序的回看区间固定于最后保存的观测，原始运行的确切日期未知。"],
    ["Signed local deviation divided by sample standard deviation with variance denominator n - 1. Each context's center and scale are aligned to the observation. Exact context lengths are withheld.", "有符号的局部偏离除以样本标准差，方差分母为 n − 1。每个背景的中心与尺度均与观测对齐，具体参考周期不公开。"],
    ["Three preserved coordinates describe different observation horizons. Zero denotes the corresponding local center. Coordinates retain their existing STD units.", "保留的三个坐标描述不同的观察周期。零表示对应的局部中心，坐标仍以对应的局部标准差为单位。"],
    ["Copied r(t,20) = x(t+20) / x(t) - 1. Twenty trading observations, not calendar days. Stored as a fraction; display 100 times the value for percent. Retrospective price change, not a prediction or net strategy return. Original Viridis normalization, camera, axis limits and depth shading are preserved in the exported figure.", "直接复制 r(t,20) = x(t+20) / x(t) − 1。这里指 20 个交易观测，不是自然日。数据以小数存储，显示百分比时乘以 100。这是事后价格变化，不是预测或策略净收益。图中保留原有 Viridis 归一化、视角、坐标范围与深度明暗。"],
    ["The archived analyzer reads its CSV, selects the sixth column (verified as close), filters a recent historical sample, computes gaussian_kde(data), and locates x[argmax(density)]. Separate archived comparison code confirms fixed absolute-price threshold comparisons. It does not establish that the density peak was the adopted cutoff.", "存档分析程序读取 CSV，选择已核对为收盘价的第六列，筛选近期历史样本，计算 gaussian_kde(data)，并定位 x[argmax(density)]。另一份存档比较代码使用固定的绝对价格阀值，但这些信息不能说明密度峰值就是实际采用的阀值。"],
    ["The exact original execution clock is unavailable. Use the last saved timestamp as the selection anchor, retain the archived analysis lookback, and fit the KDE to raw closing prices. Per-observation dates and adopted numerical settings are not exported.", "原始运行的确切时间已无法确定。重建时以最后保存的时间戳为选样锚点，保留存档分析程序的回看区间，并对原始收盘价拟合核密度。逐条观测日期和实际采用的数值设置不导出。"],
    ["Sort the selected price values to remove chronological order, save their price column, and save the min-to-max KDE grid with its density and CDF. No private method code, identifier, decision overlay, or current account state is embedded.", "对选出的价格排序，去除时间顺序，保存价格列，以及最低价到最高价之间的核密度网格、密度和累积分布。数据不包含私有方法代码、ETF 代码与名称、决策规则或当前账户状态。"],
    ["Invoke the owner's specified single-series manifold Analysis command with start date 2020-01-01 and color_by forward_return. Capture the original AnalysisResult and figure without --save. Copy all 1,601 coordinate/return rows without rounding, and export the same figure after relabeling its axes/title. Strip input identity, timestamps, prices and private reference settings. All copied labels independently match the 20-observation price ratio. No alternative financial method is introduced.", "调用原有单序列流形 Analysis 命令，起始日期为 2020-01-01，着色参数为 color_by forward_return。不使用 --save，直接获取原始 AnalysisResult 和图像。完整复制 1,601 行坐标与收益率，不作舍入；图像仅调整坐标轴与标题。移除ETF 代码与名称、时间戳、价格和私有参考设置。复制的收益标签逐条对应后续 20 个观测的价格比值，没有引入另一种金融计算方法。"],
    ["Render the same copied points interactively; drag, sliders, arrow keys and presets change camera angles only. Camera metadata is obtained by passing public copied rows through the existing repo plotting surface, never rerunning Analysis or loading private prices. Perspective coordinates match the native renderer for all 1,601 observations in six views. Viridis normalization remains fixed. The interactive scatter omits chronology, because public IDs are geometric; the original SVG retains its chronological path as a separate reference.", "对完整复制的点进行交互式绘制，视角操作只改变相机角度。相机元数据由公开复制的数据通过仓库现有绘图接口取得，不重新运行 Analysis，也不加载私有价格。六个视图中，全部 1,601 个观测的透视坐标都与原有绘图结果一致。Viridis 归一化保持固定。公开编号只对应几何位置，因此交互散点图不表示时间顺序。"],
    ["For independent plotting, use threshold-density-points.csv directly. To reproduce the curve, fit scipy.stats.gaussian_kde to the price column in threshold-observations.csv, using default bandwidth, and evaluate 1,000 evenly spaced points from its minimum to maximum. The full Gaussian KDE integrates to one; the displayed interval omits its outer tails. No project installation is needed.", "独立绘图可直接使用 threshold-density-points.csv。要重建曲线，可用默认带宽对 threshold-observations.csv 的 price 列拟合 scipy.stats.gaussian_kde，并在最低价到最高价之间计算 1,000 个等距点。完整高斯核密度的积分为 1，图示区间不包含外侧尾部。无需安装本项目。"],
    ["Load slow, medium, fast and forwardReturn directly from the copied CSV. Render using the exported scene bounds, box aspect and native perspective camera convention. Sort by view depth and apply original-style depth shading without changing Viridis return colors. Camera controls only update angles; selection adds an outline. No private method or price series is required. The original exported SVG is available separately for comparison.", "从复制的 CSV 直接读取 slow、medium、fast 和 forwardReturn。按导出的场景边界、长宽比例与原有透视相机约定绘制。根据视图深度排序，应用原有深度明暗，不改变 Viridis 收益配色。视角控制只更新角度，选中观测仅增加轮廓。无需私有方法或价格序列。"],
  ]);

  function translate(value, language) {
    if (language !== "zh") return value;
    const source = String(value);
    const text = source.replace(/\s+/g, " ").trim();
    let result = labels.get(text);
    if (!result) {
      const peak = text.match(/^Global KDE grid peak · p ≈ (.+)$/);
      const plot = text.match(/^Rotatable STD state space: (.+) exact copied observations, colored by 20-day forward price return$/);
      const point = text.match(/^(P\d+) · Slow (.+) · Medium (.+) · Fast (.+) · Forward return \(20-day\) (.+)$/);
      if (peak) result = `全局核密度网格峰值 · p ≈ ${peak[1]}`;
      else if (plot) result = `可旋转的标准差偏离状态空间：${plot[1]} 个完整复制的观测，以后续 20 个交易观测的价格收益率着色`;
      else if (point) result = `${point[1]} · 慢速 ${point[2]} · 中速 ${point[3]} · 快速 ${point[4]} · 后续 20 个交易观测收益率 ${point[5]}`;
      else if (text.startsWith("Last updated ")) result = `最后更新：${labels.get(text.slice(13)) || text.slice(13)}`;
      else if (text.startsWith("Open options for ")) result = "打开此项的选项";
      else if (text.startsWith("Source for ")) result = "查看此项的来源";
      else if (text.startsWith("Source: ")) result = `来源：${labels.get(text.slice(8)) || text.slice(8)}`;
      else if (text.startsWith("Tables: ")) result = `数据表：${text.slice(8)}`;
      else if (text.startsWith("File: ")) result = `文件：${text.slice(6)}`;
      else if (text.startsWith("Collapse ")) result = `收起 ${translate(text.slice(9), language)}`;
    }
    if (!result) return value;
    return `${source.match(/^\s*/)[0]}${result}${source.match(/\s*$/)[0]}`;
  }

  function story(id, original, language) {
    if (language !== "zh") return original;
    if (id === "threshold:caption") {
      const values = original.match(/approximately \*\*([^*]+)\*\*, with density \*\*([^*]+) per price unit\*\*/);
      if (!values) return original;
      return `图中标记的**全局网格峰值**位于价格约 **${values[1]}** 处，密度约为**每价格单位 ${values[2]}**。它是这条估计曲线的最高点，不是实际采用的阀值，也不是价格预测。曲线在更高价格处还有一个较小的集中区域，并非单一对称的钟形。高斯核估计并不假设整个价格分布服从正态分布。图示最低价到最高价区间内的面积约为 0.990，其余核密度尾部位于区间之外。`;
    }
    return Object.hasOwn(stories, id) ? stories[id] : original;
  }

  globalThis.__fzMethodI18n = { translate, story, fx, earningsThresholdCny };

  const originals = new WeakMap();
  const attributes = new WeakMap();
  const translatedAttributes = ["title", "aria-label", "alt"];
  const currentLanguage = () => document.documentElement.dataset.language === "zh" ? "zh" : "en";

  function applyText(node, language) {
    if (node.parentElement?.closest("script, style, template, [data-language-content]")) return;
    const current = node.nodeValue || "";
    let record = originals.get(node);
    // Translate known prose in source panels, but leave mathematical and code notation intact.
    if (node.parentElement?.closest("pre, code") && !record && !labels.has(current.trim())) return;
    if (!record || (current !== record.output && current !== record.source)) {
      if (translate(current, "zh") === current) return;
      record = { source: current, output: current };
      originals.set(node, record);
    }
    const target = translate(record.source, language);
    record.output = target;
    if (current !== target) node.nodeValue = target;
  }

  function applyAttribute(element, attribute, language) {
    const current = element.getAttribute(attribute);
    if (!current) return;
    let entries = attributes.get(element);
    if (!entries) attributes.set(element, entries = new Map());
    let record = entries.get(attribute);
    if (!record || (current !== record.output && current !== record.source)) {
      if (translate(current, "zh") === current) return;
      entries.set(attribute, record = { source: current, output: current });
    }
    const target = translate(record.source, language);
    record.output = target;
    if (current !== target) element.setAttribute(attribute, target);
  }

  function applyRoot(root, language) {
    if (root.nodeType === Node.TEXT_NODE) applyText(root, language);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) applyText(node, language);
    if (root instanceof Element) {
      translatedAttributes.forEach(attribute => applyAttribute(root, attribute, language));
    }
    root.querySelectorAll?.("[title], [aria-label], [alt]").forEach(element => {
      translatedAttributes.forEach(attribute => applyAttribute(element, attribute, language));
    });
  }

  function applyLanguage() {
    const language = currentLanguage();
    applyRoot(document.body, language);
    document.title = translate("From a Threshold to STD: Finding Patterns in Data", language);
    document.querySelector('meta[name="description"]')?.setAttribute("content",
      translate("How I learned to find patterns in data, from fixed price thresholds to a three-dimensional STD state.", language));
    document.getElementById("root").lang = language === "zh" ? "zh-CN" : "en";
    document.querySelector(".journal-downloads").lang = language === "zh" ? "zh-CN" : "en";
  }

  document.addEventListener("fz:languagechange", applyLanguage);
  new MutationObserver(mutations => {
    const language = currentLanguage();
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) applyRoot(node, language);
      if (mutation.type === "characterData") applyText(mutation.target, language);
      if (mutation.type === "attributes") applyAttribute(mutation.target, mutation.attributeName, language);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: translatedAttributes });
  applyLanguage();
})();
