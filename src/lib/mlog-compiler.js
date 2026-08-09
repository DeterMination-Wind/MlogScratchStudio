import {stageBlockTypes} from './mindustry-assets';

const EXPECTED_TOKENS = {
    read: 4,
    write: 4,
    print: 2,
    drawflush: 2,
    printflush: 2,
    getlink: 3,
    control: 7,
    radar: 8,
    sensor: 4,
    set: 3,
    op: 5,
    select: 7,
    wait: 2,
    end: 1,
    jump: 5,
    ubind: 2,
    ucontrol: 7,
    uradar: 8,
    ulocate: 9,
    getblock: 5,
    setblock: 7,
    spawn: 7,
    setrule: 7,
    message: 4
};

const CONDITION_OPS = new Set([
    'equal',
    'notEqual',
    'lessThan',
    'lessThanEq',
    'greaterThan',
    'greaterThanEq',
    'strictEqual',
    'always'
]);

const CONDITION_ALIASES = {
    '==': 'equal',
    '=': 'equal',
    '===': 'strictEqual',
    '!=': 'notEqual',
    '<': 'lessThan',
    '<=': 'lessThanEq',
    '>': 'greaterThan',
    '>=': 'greaterThanEq'
};

const CONDITION_INVERSES = {
    equal: 'notEqual',
    notEqual: 'equal',
    lessThan: 'greaterThanEq',
    lessThanEq: 'greaterThan',
    greaterThan: 'lessThanEq',
    greaterThanEq: 'lessThan',
    strictEqual: 'notEqual'
};

const LOGIC_OPS = new Set([
    'add',
    'sub',
    'mul',
    'div',
    'idiv',
    'mod',
    'emod',
    'pow',
    'equal',
    'notEqual',
    'land',
    'lessThan',
    'lessThanEq',
    'greaterThan',
    'greaterThanEq',
    'strictEqual',
    'shl',
    'shr',
    'ushr',
    'or',
    'and',
    'xor',
    'not',
    'max',
    'min',
    'angle',
    'angleDiff',
    'len',
    'noise',
    'abs',
    'sign',
    'log',
    'logn',
    'log10',
    'floor',
    'ceil',
    'round',
    'sqrt',
    'rand',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan'
]);

const RADAR_TARGETS = new Set(['any', 'enemy', 'ally', 'player', 'attacker', 'flying', 'boss', 'ground']);
const RADAR_SORTS = new Set(['distance', 'health', 'shield', 'armor', 'maxHealth']);
const CONTROL_MODES = new Set(['enabled', 'shoot', 'shootp', 'config', 'color']);
const UNIT_CONTROL_MODES = new Set([
    'idle',
    'stop',
    'move',
    'approach',
    'pathfind',
    'autoPathfind',
    'boost',
    'target',
    'targetp',
    'itemDrop',
    'itemTake',
    'payDrop',
    'payTake',
    'payEnter',
    'mine',
    'flag',
    'build',
    'deconstruct',
    'getBlock',
    'within',
    'unbind'
]);
const LOCATE_TYPES = new Set(['ore', 'building', 'spawn', 'damaged']);
const BLOCK_FLAGS = new Set(['core', 'storage', 'generator', 'turret', 'factory', 'repair', 'battery', 'reactor', 'drill', 'shield']);
const TILE_LAYERS = new Set(['floor', 'ore', 'block', 'building']);
const TILE_LAYER_SETTABLES = new Set(['floor', 'ore', 'block']);
const MESSAGE_TYPES = new Set(['notify', 'announce', 'toast', 'mission']);
const LOGIC_RULES = new Set([
    'currentWaveTime',
    'waveTimer',
    'waves',
    'wave',
    'waveSpacing',
    'waveSending',
    'attackMode',
    'enemyCoreBuildRadius',
    'dropZoneRadius',
    'unitCap',
    'mapArea',
    'lighting',
    'canGameOver',
    'ambientLight',
    'solarMultiplier',
    'dragMultiplier',
    'ban',
    'unban',
    'pauseDisabled',
    'buildSpeed',
    'unitHealth',
    'unitBuildSpeed',
    'unitMineSpeed',
    'unitCost',
    'unitDamage',
    'blockHealth',
    'blockDamage',
    'rtsMinWeight',
    'rtsMinSquad'
]);

const objectHasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const normalizeProject = projectSnapshot => {
    const source = projectSnapshot && typeof projectSnapshot === 'object' ? projectSnapshot : {};
    const stage = source.stage && typeof source.stage === 'object' ? source.stage : {};
    return {
        ...source,
        title: token(source.title, 'Mlog Scratch UI'),
        stage: {
            ...stage,
            nodes: Array.isArray(stage.nodes) ? stage.nodes : []
        },
        processors: Array.isArray(source.processors) ? source.processors : [],
        sharedLists: Array.isArray(source.sharedLists) ? source.sharedLists : []
    };
};

const token = (value, fallback = '0') => {
    const text = value === null || value === undefined ? '' : String(value).trim();
    return text || fallback;
};

const tokenList = value => {
    if (Array.isArray(value)) {
        return value.map(item => token(item, '')).filter(Boolean);
    }
    return token(value, '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
};

const safeLabel = (value, fallback = 'label') => {
    const text = token(value, fallback)
        .replace(/[^A-Za-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '');
    return text || fallback;
};

const valueToken = (value, fallback = '0') => {
    const text = token(value, fallback);
    if (/^".*"$/.test(text)) return text;
    if (/^-?\d+(\.\d+)?$/.test(text)) return text;
    if (/^@[A-Za-z0-9_./-]+$/.test(text)) return text;
    if (/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(text)) return text;
    return JSON.stringify(text);
};

const frameValueToken = (frame, value, fallback = '0') => {
    const text = token(value, '');
    if (frame && frame.bindings && frame.bindings.has(text)) {
        return token(frame.bindings.get(text), fallback);
    }
    return valueToken(value, fallback);
};

const field = (block, key, fallback = '') => {
    const fields = block && block.fields && typeof block.fields === 'object' ? block.fields : {};
    if (!objectHasOwn(fields, key)) return fallback;
    const value = fields[key];
    if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : fallback;
    }
    return token(value, fallback);
};

const fieldList = (block, key) => {
    const fields = block && block.fields && typeof block.fields === 'object' ? block.fields : {};
    return objectHasOwn(fields, key) ? tokenList(fields[key]) : [];
};

const choose = (value, allowed, fallback) => {
    const text = token(value, fallback);
    return allowed.has(text) ? text : fallback;
};

const normalizeConditionOp = value => {
    const text = token(value, 'equal');
    if (CONDITION_ALIASES[text]) return CONDITION_ALIASES[text];
    return CONDITION_OPS.has(text) ? text : 'equal';
};

const emitStatement = (name, args = []) => {
    const parts = [name, ...args.map(arg => token(arg, '0'))];
    const expected = EXPECTED_TOKENS[name] || parts.length;
    while (parts.length < expected) {
        parts.push('0');
    }
    return parts.join(' ');
};

const indent = level => '  '.repeat(Math.max(0, level));

const line = (indentLevel, text) => `${indent(indentLevel)}${text}`;

const addDiagnostic = (ctx, level, message, block) => {
    ctx.diagnostics.push({
        level,
        message,
        fileName: ctx.fileName,
        processorId: ctx.processor.id,
        blockId: block && block.id,
        opcode: block && block.opcode,
        source: 'compiler'
    });
};

const parseCondition = (conditionText, frame = null) => {
    const text = token(conditionText, '');
    if (!text) return null;
    if (text === 'true') return {kind: 'boolean', value: true};
    if (text === 'false') return {kind: 'boolean', value: false};

    const directParts = text.split(/\s+/);
    if (directParts.length === 1 && directParts[0] === 'always') {
        return {kind: 'comparison', op: 'always', left: '0', right: '0'};
    }
    if (directParts.length === 3 && CONDITION_OPS.has(directParts[0])) {
        return {
            kind: 'comparison',
            op: directParts[0],
            left: frameValueToken(frame, directParts[1]),
            right: frameValueToken(frame, directParts[2])
        };
    }

    const match = text.match(/^(.*?)(===|==|!=|<=|>=|<|>)(.*)$/);
    if (!match) return null;

    const left = token(match[1], '');
    const op = CONDITION_ALIASES[match[2]];
    const right = token(match[3], '');
    if (!left || !op || !right) return null;
    return {
        kind: 'comparison',
        op,
        left: frameValueToken(frame, left),
        right: frameValueToken(frame, right)
    };
};

const invertedCondition = condition => {
    if (!condition || condition.kind !== 'comparison') return null;
    const inverted = CONDITION_INVERSES[condition.op];
    if (!inverted) return null;
    return {
        ...condition,
        op: inverted
    };
};

const buildListIndex = sharedLists => {
    const index = new Map();
    sharedLists.forEach(list => {
        if (!list || typeof list !== 'object') return;
        [list.id, list.name, list.cell].forEach(key => {
            const text = token(key, '');
            if (text && !index.has(text)) {
                index.set(text, list);
            }
        });
    });
    return index;
};

const resolveList = (ctx, block) => {
    const ref = field(block, 'list', field(block, 'name', 'items'));
    return ctx.lists.get(ref) || null;
};

const findStageNode = (project, id) => (
    project.stage.nodes.find(node => node && node.id === id) || null
);

const linkSummary = (project, processor) => {
    const links = Array.isArray(processor.links) ? processor.links : [];
    return links.map((id, index) => {
        const node = findStageNode(project, id);
        const linkName = node && node.linkName ? node.linkName : id;
        return `${index + 1}:${linkName}`;
    });
};

const functionName = block => safeLabel(field(block, 'name', block && block.label ? block.label : 'fun'), 'fun');

const functionParams = block => {
    const params = fieldList(block, 'params');
    return params.length > 0 ? params.map(param => safeLabel(param, 'arg')) : [];
};

const scanFunctions = (blocks, ctx) => {
    if (!Array.isArray(blocks)) return;
    blocks.forEach(block => {
        if (!block || typeof block !== 'object') return;
        if (block.opcode === 'fun_define') {
            const name = functionName(block);
            if (ctx.functions.has(name)) {
                addDiagnostic(ctx, 'warning', `函数 ${name} 重复定义，后续定义会被忽略。`, block);
            } else {
                ctx.functions.set(name, {
                    block,
                    name,
                    params: functionParams(block),
                    body: Array.isArray(block.body) ? block.body : []
                });
            }
        }
        if (Array.isArray(block.body)) scanFunctions(block.body, ctx);
        if (Array.isArray(block.elseBody)) scanFunctions(block.elseBody, ctx);
    });
};

const createProcessorContext = (project, processor, processorIndex) => {
    const node = findStageNode(project, processor.stageNodeId);
    const nodeInfo = node ? stageBlockTypes[node.type] : null;
    const fileBase = `${safeLabel(project.title, 'project')}-${safeLabel(processor.name || processor.id, `processor_${processorIndex + 1}`)}`;
    const ctx = {
        project,
        processor,
        processorIndex,
        node,
        nodeInfo,
        worldProcessor: node ? node.type === 'world-processor' : false,
        fileName: `${fileBase}.mlog`,
        diagnostics: [],
        functions: new Map(),
        lists: buildListIndex(project.sharedLists),
        labelCounter: 0,
        tempCounter: 0
    };
    scanFunctions(processor.program && Array.isArray(processor.program.blocks) ? processor.program.blocks : [], ctx);
    return ctx;
};

const nextLabel = (ctx, prefix) => {
    ctx.labelCounter += 1;
    return `${safeLabel(prefix, 'label')}_${ctx.labelCounter}`;
};

const nextTemp = (ctx, prefix) => {
    ctx.tempCounter += 1;
    return `__mlog_${safeLabel(prefix, 'tmp')}_${ctx.tempCounter}`;
};

const hasBody = block => Array.isArray(block.body) && block.body.length > 0;

const compileBlockList = (blocks, ctx, indentLevel, frame = null) => {
    if (!Array.isArray(blocks)) return [];
    return blocks.reduce((lines, block) => lines.concat(compileBlock(block, ctx, indentLevel, frame)), []);
};

const compileEmptyContainer = (block, ctx, indentLevel, labelText) => {
    addDiagnostic(ctx, 'warning', `${labelText} 还没有嵌套 body，当前只作为结构占位。`, block);
    return [line(indentLevel, `# ${labelText}`)];
};

const compileIf = (block, ctx, indentLevel, frame) => {
    if (!hasBody(block)) {
        return compileEmptyContainer(block, ctx, indentLevel, `if ${field(block, 'condition', 'condition')}`);
    }

    const condition = parseCondition(field(block, 'condition', 'condition'), frame);
    const lines = [line(indentLevel, `# if ${field(block, 'condition', 'condition')}`)];
    if (!condition) {
        addDiagnostic(ctx, 'warning', `无法解析 if 条件：${field(block, 'condition', 'condition')}，body 会按顺序展开。`, block);
        return lines.concat(compileBlockList(block.body, ctx, indentLevel + 1, frame));
    }
    if (condition.kind === 'boolean') {
        if (!condition.value) return lines.concat([line(indentLevel, '# if false: body skipped')]);
        return lines.concat(compileBlockList(block.body, ctx, indentLevel + 1, frame));
    }

    const skipCondition = invertedCondition(condition);
    if (!skipCondition) {
        return lines.concat(compileBlockList(block.body, ctx, indentLevel + 1, frame));
    }

    const endLabel = nextLabel(ctx, 'if_end');
    lines.push(line(indentLevel, emitStatement('jump', [endLabel, skipCondition.op, skipCondition.left, skipCondition.right])));
    lines.push(...compileBlockList(block.body, ctx, indentLevel + 1, frame));
    lines.push(line(indentLevel, `${endLabel}:`));
    return lines;
};

const compileIfElse = (block, ctx, indentLevel, frame) => {
    if (!hasBody(block)) {
        return compileEmptyContainer(block, ctx, indentLevel, `if else ${field(block, 'condition', 'condition')}`);
    }

    const elseBody = Array.isArray(block.elseBody) ? block.elseBody : [];
    const condition = parseCondition(field(block, 'condition', 'condition'), frame);
    const lines = [line(indentLevel, `# if else ${field(block, 'condition', 'condition')}`)];
    if (!condition) {
        addDiagnostic(ctx, 'warning', `无法解析 if else 条件：${field(block, 'condition', 'condition')}，then body 会按顺序展开。`, block);
        return lines.concat(compileBlockList(block.body, ctx, indentLevel + 1, frame));
    }
    if (condition.kind === 'boolean') {
        return lines.concat(compileBlockList(condition.value ? block.body : elseBody, ctx, indentLevel + 1, frame));
    }

    const elseLabel = nextLabel(ctx, 'else');
    const endLabel = nextLabel(ctx, 'if_else_end');
    const skipCondition = invertedCondition(condition);
    if (!skipCondition) {
        return lines.concat(compileBlockList(block.body, ctx, indentLevel + 1, frame));
    }
    lines.push(line(indentLevel, emitStatement('jump', [elseLabel, skipCondition.op, skipCondition.left, skipCondition.right])));
    lines.push(...compileBlockList(block.body, ctx, indentLevel + 1, frame));
    lines.push(line(indentLevel, emitStatement('jump', [endLabel, 'always', '0', '0'])));
    lines.push(line(indentLevel, `${elseLabel}:`));
    if (elseBody.length === 0) {
        addDiagnostic(ctx, 'warning', 'if else 暂无 else body，else 分支为空。', block);
    } else {
        lines.push(...compileBlockList(elseBody, ctx, indentLevel + 1, frame));
    }
    lines.push(line(indentLevel, `${endLabel}:`));
    return lines;
};

const compileWhile = (block, ctx, indentLevel, frame) => {
    if (!hasBody(block)) {
        return compileEmptyContainer(block, ctx, indentLevel, `while ${field(block, 'condition', 'condition')}`);
    }

    const condition = parseCondition(field(block, 'condition', 'condition'), frame);
    const lines = [line(indentLevel, `# while ${field(block, 'condition', 'condition')}`)];
    if (!condition) {
        addDiagnostic(ctx, 'warning', `while 条件暂不能安全降低：${field(block, 'condition', 'condition')}，body 会按顺序展开。`, block);
        return lines.concat(compileBlockList(block.body, ctx, indentLevel + 1, frame));
    }
    if (condition.kind === 'boolean') {
        if (!condition.value) {
            return lines.concat([line(indentLevel, '# while false: body skipped')]);
        }
        addDiagnostic(ctx, 'warning', `while true 会被展开成线性 body，避免生成死循环。`, block);
        return lines.concat(compileBlockList(block.body, ctx, indentLevel + 1, frame));
    }

    const startLabel = nextLabel(ctx, 'while_start');
    const endLabel = nextLabel(ctx, 'while_end');
    const skipCondition = invertedCondition(condition);
    lines.push(line(indentLevel, `${startLabel}:`));
    if (skipCondition) {
        lines.push(line(indentLevel, emitStatement('jump', [endLabel, skipCondition.op, skipCondition.left, skipCondition.right])));
    }
    lines.push(...compileBlockList(block.body, ctx, indentLevel + 1, frame));
    lines.push(line(indentLevel, emitStatement('jump', [startLabel, 'always', '0', '0'])));
    lines.push(line(indentLevel, `${endLabel}:`));
    return lines;
};

const compileForRange = (block, ctx, indentLevel, frame) => {
    if (!hasBody(block)) {
        return compileEmptyContainer(
            block,
            ctx,
            indentLevel,
            `for ${field(block, 'var', 'i')} in ${field(block, 'start', '0')}..${field(block, 'end', '10')}`
        );
    }

    const variable = token(field(block, 'var', 'i'), 'i');
    const start = frameValueToken(frame, field(block, 'start', '0'));
    const end = frameValueToken(frame, field(block, 'end', '10'));
    const loopLabel = nextLabel(ctx, 'for_start');
    const endLabel = nextLabel(ctx, 'for_end');
    const lines = [
        line(indentLevel, `# for ${variable} in ${start}..${end}`),
        line(indentLevel, emitStatement('set', [variable, start])),
        line(indentLevel, `${loopLabel}:`),
        line(indentLevel, emitStatement('jump', [endLabel, 'greaterThanEq', variable, end]))
    ];
    lines.push(...compileBlockList(block.body, ctx, indentLevel + 1, frame));
    lines.push(line(indentLevel, emitStatement('op', ['add', variable, variable, '1'])));
    lines.push(line(indentLevel, emitStatement('jump', [loopLabel, 'always', '0', '0'])));
    lines.push(line(indentLevel, `${endLabel}:`));
    return lines;
};

const listLocation = (list, fallbackName) => ({
    name: token(list && list.name, fallbackName),
    cell: token(list && list.cell, 'cell1'),
    start: Number.isFinite(Number(list && list.start)) ? Number(list.start) : 0,
    length: Math.max(1, Number.isFinite(Number(list && list.length)) ? Number(list.length) : 1)
});

const compileListGet = (block, ctx, indentLevel, frame = null) => {
    const list = resolveList(ctx, block);
    if (!list) {
        addDiagnostic(ctx, 'error', `找不到 list：${field(block, 'list', field(block, 'name', 'items'))}`, block);
        return [line(indentLevel, `# list get missing ${field(block, 'list', field(block, 'name', 'items'))}`)];
    }

    const loc = listLocation(list, field(block, 'list', 'items'));
    const out = token(field(block, 'out', 'result'), 'result');
    const index = frameValueToken(frame, field(block, 'index', '0'));
    const addr = nextTemp(ctx, 'list_addr');
    return [
        line(indentLevel, `# list get ${loc.name}[${index}]`),
        line(indentLevel, emitStatement('op', ['add', addr, String(loc.start), index])),
        line(indentLevel, emitStatement('read', [out, loc.cell, addr]))
    ];
};

const compileListSet = (block, ctx, indentLevel, frame = null) => {
    const list = resolveList(ctx, block);
    if (!list) {
        addDiagnostic(ctx, 'error', `找不到 list：${field(block, 'list', field(block, 'name', 'items'))}`, block);
        return [line(indentLevel, `# list set missing ${field(block, 'list', field(block, 'name', 'items'))}`)];
    }

    const loc = listLocation(list, field(block, 'list', 'items'));
    const index = frameValueToken(frame, field(block, 'index', '0'));
    const value = frameValueToken(frame, field(block, 'value', 'value'));
    const addr = nextTemp(ctx, 'list_addr');
    return [
        line(indentLevel, `# list set ${loc.name}[${index}]`),
        line(indentLevel, emitStatement('op', ['add', addr, String(loc.start), index])),
        line(indentLevel, emitStatement('write', [value, loc.cell, addr]))
    ];
};

const compileListFindFirst = (block, ctx, indentLevel, frame = null) => {
    const list = resolveList(ctx, block);
    if (!list) {
        addDiagnostic(ctx, 'error', `找不到 list：${field(block, 'list', 'items')}`, block);
        return [line(indentLevel, `# list find first missing ${field(block, 'list', 'items')}`)];
    }

    const loc = listLocation(list, field(block, 'list', 'items'));
    const out = token(field(block, 'out', 'result'), 'result');
    const value = frameValueToken(frame, field(block, 'value', 'x'));
    const index = nextTemp(ctx, 'list_i');
    const addr = nextTemp(ctx, 'list_addr');
    const current = nextTemp(ctx, 'list_value');
    const loopLabel = nextLabel(ctx, 'list_find_loop');
    const hitLabel = nextLabel(ctx, 'list_find_hit');
    const endLabel = nextLabel(ctx, 'list_find_end');
    return [
        line(indentLevel, `# list find first ${loc.name} == ${value}`),
        line(indentLevel, emitStatement('set', [out, '-1'])),
        line(indentLevel, emitStatement('set', [index, '0'])),
        line(indentLevel, `${loopLabel}:`),
        line(indentLevel, emitStatement('jump', [endLabel, 'greaterThanEq', index, String(loc.length)])),
        line(indentLevel, emitStatement('op', ['add', addr, String(loc.start), index])),
        line(indentLevel, emitStatement('read', [current, loc.cell, addr])),
        line(indentLevel, emitStatement('jump', [hitLabel, 'equal', current, value])),
        line(indentLevel, emitStatement('op', ['add', index, index, '1'])),
        line(indentLevel, emitStatement('jump', [loopLabel, 'always', '0', '0'])),
        line(indentLevel, `${hitLabel}:`),
        line(indentLevel, emitStatement('set', [out, index])),
        line(indentLevel, `${endLabel}:`)
    ];
};

const compileListCountValue = (block, ctx, indentLevel, frame = null) => {
    const list = resolveList(ctx, block);
    if (!list) {
        addDiagnostic(ctx, 'error', `找不到 list：${field(block, 'list', 'items')}`, block);
        return [line(indentLevel, `# list count missing ${field(block, 'list', 'items')}`)];
    }

    const loc = listLocation(list, field(block, 'list', 'items'));
    const out = token(field(block, 'out', 'result'), 'result');
    const value = frameValueToken(frame, field(block, 'value', 'x'));
    const index = nextTemp(ctx, 'list_i');
    const addr = nextTemp(ctx, 'list_addr');
    const current = nextTemp(ctx, 'list_value');
    const loopLabel = nextLabel(ctx, 'list_count_loop');
    const skipLabel = nextLabel(ctx, 'list_count_skip');
    const endLabel = nextLabel(ctx, 'list_count_end');
    return [
        line(indentLevel, `# list count ${loc.name} == ${value}`),
        line(indentLevel, emitStatement('set', [out, '0'])),
        line(indentLevel, emitStatement('set', [index, '0'])),
        line(indentLevel, `${loopLabel}:`),
        line(indentLevel, emitStatement('jump', [endLabel, 'greaterThanEq', index, String(loc.length)])),
        line(indentLevel, emitStatement('op', ['add', addr, String(loc.start), index])),
        line(indentLevel, emitStatement('read', [current, loc.cell, addr])),
        line(indentLevel, emitStatement('jump', [skipLabel, 'notEqual', current, value])),
        line(indentLevel, emitStatement('op', ['add', out, out, '1'])),
        line(indentLevel, `${skipLabel}:`),
        line(indentLevel, emitStatement('op', ['add', index, index, '1'])),
        line(indentLevel, emitStatement('jump', [loopLabel, 'always', '0', '0'])),
        line(indentLevel, `${endLabel}:`)
    ];
};

const compileFunctionCall = (block, ctx, indentLevel, frame) => {
    const name = functionName(block);
    const definition = ctx.functions.get(name);
    const args = fieldList(block, 'args');
    const out = field(block, 'out', '');
    if (!definition || definition.body.length === 0) {
        addDiagnostic(ctx, 'warning', `函数 ${name} 暂无可内联 body，当前只输出注释。`, block);
        return [line(indentLevel, `# call fun ${name}(${args.join(', ')})`)];
    }

    const callStack = frame && Array.isArray(frame.callStack) ? frame.callStack : [];
    if (callStack.includes(name)) {
        addDiagnostic(ctx, 'warning', `函数 ${name} 递归调用暂不展开。`, block);
        return [line(indentLevel, `# recursive fun ${name} skipped`)];
    }

    const returnLabel = nextLabel(ctx, `fun_${name}_return`);
    const returnValue = nextTemp(ctx, `fun_${name}_value`);
    const bindings = new Map();
    definition.params.forEach((param, index) => {
        bindings.set(param, frameValueToken(frame, args[index] || param));
    });
    const functionFrame = {
        callStack: callStack.concat(name),
        functionName: name,
        returnLabel,
        returnValue,
        bindings
    };

    const lines = [line(indentLevel, `# call fun ${name}(${args.join(', ')})`)];
    lines.push(...compileBlockList(definition.body, ctx, indentLevel + 1, functionFrame));
    lines.push(line(indentLevel, `${returnLabel}:`));
    if (out) {
        lines.push(line(indentLevel, emitStatement('set', [token(out, 'result'), returnValue])));
    }
    return lines;
};

const compileFunArg = (block, ctx, indentLevel, frame) => {
    const name = safeLabel(field(block, 'name', 'arg'), 'arg');
    if (!frame || !frame.bindings || !frame.bindings.has(name)) {
        addDiagnostic(ctx, 'warning', `函数参数 ${name} 没有调用绑定，当前只输出注释。`, block);
        return [line(indentLevel, `# arg ${name}`)];
    }
    return [line(indentLevel, `# arg ${name} -> ${frame.bindings.get(name)}`)];
};

const compileFunReturn = (block, ctx, indentLevel, frame) => {
    if (!frame || !frame.returnLabel || !frame.returnValue) {
        addDiagnostic(ctx, 'warning', 'return 只能在内联函数 body 中降低。', block);
        return [line(indentLevel, `# return ${field(block, 'value', 'result')}`)];
    }
    return [
        line(indentLevel, emitStatement('set', [frame.returnValue, frameValueToken(frame, field(block, 'value', 'result'))])),
        line(indentLevel, emitStatement('jump', [frame.returnLabel, 'always', '0', '0']))
    ];
};

const compileBlock = (block, ctx, indentLevel, frame = null) => {
    if (!block || typeof block !== 'object') {
        return [];
    }

    switch (block.opcode) {
    case 'comment':
        return [line(indentLevel, `# ${field(block, 'text', block.label || 'comment')}`)];
    case 'print':
        return [line(indentLevel, emitStatement('print', [frameValueToken(frame, field(block, 'value', 'message'))]))];
    case 'printflush':
        return [line(indentLevel, emitStatement('printflush', [token(field(block, 'message', 'message1'), 'message1')]))];
    case 'read':
        return [line(indentLevel, emitStatement('read', [
            token(field(block, 'out', 'result'), 'result'),
            token(field(block, 'cell', 'cell1'), 'cell1'),
            frameValueToken(frame, field(block, 'index', '0'))
        ]))];
    case 'write':
        return [line(indentLevel, emitStatement('write', [
            frameValueToken(frame, field(block, 'value', 'value')),
            token(field(block, 'cell', 'cell1'), 'cell1'),
            frameValueToken(frame, field(block, 'index', '0'))
        ]))];
    case 'set':
        return [line(indentLevel, emitStatement('set', [
            token(field(block, 'out', 'result'), 'result'),
            frameValueToken(frame, field(block, 'value', '1'))
        ]))];
    case 'op_add':
        return [line(indentLevel, emitStatement('op', [
            'add',
            token(field(block, 'out', 'out'), 'out'),
            frameValueToken(frame, field(block, 'a', 'a')),
            frameValueToken(frame, field(block, 'b', 'b'))
        ]))];
    case 'compare':
        return [line(indentLevel, emitStatement('op', [
            choose(field(block, 'op', 'lessThan'), LOGIC_OPS, 'lessThan'),
            token(field(block, 'out', 'result'), 'result'),
            frameValueToken(frame, field(block, 'a', 'a')),
            frameValueToken(frame, field(block, 'b', 'b'))
        ]))];
    case 'select':
        return [line(indentLevel, emitStatement('select', [
            normalizeConditionOp(field(block, 'cond', 'equal')),
            token(field(block, 'out', 'result'), 'result'),
            frameValueToken(frame, field(block, 'a', 'a')),
            frameValueToken(frame, field(block, 'b', 'b'))
        ]))];
    case 'packcolor':
        return [line(indentLevel, emitStatement('packcolor', [
            token(field(block, 'out', 'color'), 'color'),
            frameValueToken(frame, field(block, 'r', '0')),
            frameValueToken(frame, field(block, 'g', '0')),
            frameValueToken(frame, field(block, 'b', '0')),
            frameValueToken(frame, field(block, 'a', '1'))
        ]))];
    case 'sensor':
        return [line(indentLevel, emitStatement('sensor', [
            token(field(block, 'out', 'result'), 'result'),
            token(field(block, 'target', '@unit'), '@unit'),
            token(field(block, 'property', 'health'), 'health')
        ]))];
    case 'control':
        return [line(indentLevel, emitStatement('control', [
            choose(field(block, 'mode', 'enabled'), CONTROL_MODES, 'enabled'),
            token(field(block, 'target', '@unit'), '@unit'),
            frameValueToken(frame, field(block, 'p1', '0')),
            frameValueToken(frame, field(block, 'p2', '0')),
            frameValueToken(frame, field(block, 'p3', '0')),
            frameValueToken(frame, field(block, 'p4', '0'))
        ]))];
    case 'getlink':
        return [line(indentLevel, emitStatement('getlink', [
            token(field(block, 'out', 'link'), 'link'),
            frameValueToken(frame, field(block, 'index', '0'))
        ]))];
    case 'radar':
        return [line(indentLevel, emitStatement('radar', [
            choose(field(block, 'target1', 'any'), RADAR_TARGETS, 'any'),
            choose(field(block, 'target2', 'any'), RADAR_TARGETS, 'any'),
            choose(field(block, 'target3', 'any'), RADAR_TARGETS, 'any'),
            choose(field(block, 'sort', 'distance'), RADAR_SORTS, 'distance'),
            frameValueToken(frame, field(block, 'order', '1')),
            frameValueToken(frame, field(block, 'from', '0')),
            token(field(block, 'out', 'target'), 'target')
        ]))];
    case 'drawflush':
        return [line(indentLevel, emitStatement('drawflush', [token(field(block, 'display', 'display1'), 'display1')]))];
    case 'ubind':
        return [line(indentLevel, emitStatement('ubind', [token(field(block, 'unit', '@dagger'), '@dagger')]))];
    case 'ucontrol':
        return [line(indentLevel, emitStatement('ucontrol', [
            choose(field(block, 'mode', 'idle'), UNIT_CONTROL_MODES, 'idle'),
            frameValueToken(frame, field(block, 'p1', '0')),
            frameValueToken(frame, field(block, 'p2', '0')),
            frameValueToken(frame, field(block, 'p3', '0')),
            frameValueToken(frame, field(block, 'p4', '0')),
            frameValueToken(frame, field(block, 'p5', '0'))
        ]))];
    case 'uradar':
        return [line(indentLevel, emitStatement('uradar', [
            choose(field(block, 'target1', 'any'), RADAR_TARGETS, 'any'),
            choose(field(block, 'target2', 'any'), RADAR_TARGETS, 'any'),
            choose(field(block, 'target3', 'any'), RADAR_TARGETS, 'any'),
            choose(field(block, 'sort', 'distance'), RADAR_SORTS, 'distance'),
            frameValueToken(frame, field(block, 'order', '1')),
            frameValueToken(frame, field(block, 'from', '0')),
            token(field(block, 'out', 'target'), 'target')
        ]))];
    case 'ulocate':
        return [line(indentLevel, emitStatement('ulocate', [
            choose(field(block, 'type', 'ore'), LOCATE_TYPES, 'ore'),
            choose(field(block, 'flag', 'core'), BLOCK_FLAGS, 'core'),
            frameValueToken(frame, field(block, 'arg1', '@copper')),
            frameValueToken(frame, field(block, 'arg2', '0')),
            frameValueToken(frame, field(block, 'arg3', '0')),
            frameValueToken(frame, field(block, 'arg4', '0')),
            frameValueToken(frame, field(block, 'arg5', '0')),
            frameValueToken(frame, field(block, 'arg6', '0'))
        ]))];
    case 'getblock':
        return [line(indentLevel, emitStatement('getblock', [
            choose(field(block, 'layer', 'block'), TILE_LAYERS, 'block'),
            frameValueToken(frame, field(block, 'x', '0')),
            frameValueToken(frame, field(block, 'y', '0')),
            token(field(block, 'out', 'tile'), 'tile')
        ]))];
    case 'setblock':
        return [line(indentLevel, emitStatement('setblock', [
            choose(field(block, 'layer', 'block'), TILE_LAYER_SETTABLES, 'block'),
            frameValueToken(frame, field(block, 'x', '0')),
            frameValueToken(frame, field(block, 'y', '0')),
            frameValueToken(frame, field(block, 'rotation', '0')),
            token(field(block, 'team', '@sharded'), '@sharded'),
            frameValueToken(frame, field(block, 'build', '0'))
        ]))];
    case 'spawn':
        return [line(indentLevel, emitStatement('spawn', [
            token(field(block, 'unit', '@dagger'), '@dagger'),
            frameValueToken(frame, field(block, 'x', '0')),
            frameValueToken(frame, field(block, 'y', '0')),
            frameValueToken(frame, field(block, 'rotation', '0')),
            token(field(block, 'team', '@sharded'), '@sharded'),
            token(field(block, 'out', 'result'), 'result')
        ]))];
    case 'setrule':
        return [line(indentLevel, emitStatement('setrule', [
            choose(field(block, 'rule', 'attackMode'), LOGIC_RULES, 'attackMode'),
            frameValueToken(frame, field(block, 'value', 'true')),
            frameValueToken(frame, field(block, 'arg1', '0')),
            frameValueToken(frame, field(block, 'arg2', '0')),
            frameValueToken(frame, field(block, 'arg3', '0')),
            frameValueToken(frame, field(block, 'arg4', '0'))
        ]))];
    case 'message':
        return [line(indentLevel, emitStatement('message', [
            choose(field(block, 'type', 'notify'), MESSAGE_TYPES, 'notify'),
            frameValueToken(frame, field(block, 'text', 'hello')),
            frameValueToken(frame, field(block, 'duration', '60'))
        ]))];
    case 'wait':
        return [line(indentLevel, emitStatement('wait', [frameValueToken(frame, field(block, 'seconds', '1'))]))];
    case 'end':
        return [line(indentLevel, emitStatement('end'))];
    case 'if':
        return compileIf(block, ctx, indentLevel, frame);
    case 'if_else':
        return compileIfElse(block, ctx, indentLevel, frame);
    case 'while':
        return compileWhile(block, ctx, indentLevel, frame);
    case 'for_range':
        return compileForRange(block, ctx, indentLevel, frame);
    case 'list_define':
        return [line(indentLevel, `# list ${field(block, 'name', 'items')} ${field(block, 'cell', 'cell1')}#${field(block, 'start', '0')} len ${field(block, 'length', '16')}`)];
    case 'list_get':
        return compileListGet(block, ctx, indentLevel, frame);
    case 'list_set':
        return compileListSet(block, ctx, indentLevel, frame);
    case 'list_find_first':
        return compileListFindFirst(block, ctx, indentLevel, frame);
    case 'list_count_value':
        return compileListCountValue(block, ctx, indentLevel, frame);
    case 'fun_define':
        if (!hasBody(block)) {
            addDiagnostic(ctx, 'warning', `函数 ${functionName(block)} 还没有 body。`, block);
        }
        return [line(indentLevel, `# fun ${functionName(block)}(${functionParams(block).join(', ')})`)];
    case 'fun_call':
        return compileFunctionCall(block, ctx, indentLevel, frame);
    case 'fun_return':
        return compileFunReturn(block, ctx, indentLevel, frame);
    case 'fun_arg':
        return compileFunArg(block, ctx, indentLevel, frame);
    case 'link':
        return [line(indentLevel, `# link ref ${field(block, 'name', 'logic1')}`)];
    case 'global':
        return [line(indentLevel, `# global ${field(block, 'name', '@unit')}`)];
    case 'symbol':
        return [line(indentLevel, `# symbol ${field(block, 'raw', 'foo')}`)];
    case 'list_ref': {
        const list = resolveList(ctx, block);
        if (!list) {
            addDiagnostic(ctx, 'warning', `找不到 list ref：${field(block, 'name', 'items')}`, block);
            return [line(indentLevel, `# list ref missing ${field(block, 'name', 'items')}`)];
        }
        const loc = listLocation(list, field(block, 'name', 'items'));
        return [line(indentLevel, `# list ref ${loc.name} -> ${loc.cell}#${loc.start} len ${loc.length}`)];
    }
    default:
        addDiagnostic(ctx, 'warning', `暂不支持积木 opcode：${block.opcode}`, block);
        return [line(indentLevel, `# unsupported ${block.opcode || 'block'}`)];
    }
};

const compileProcessor = (project, processor, processorIndex) => {
    const safeProcessor = processor && typeof processor === 'object' ? processor : {};
    const blocks = safeProcessor.program && Array.isArray(safeProcessor.program.blocks) ? safeProcessor.program.blocks : [];
    const ctx = createProcessorContext(project, safeProcessor, processorIndex);
    const lines = [
        `# processor: ${token(safeProcessor.name, `processor ${processorIndex + 1}`)}`,
        `# file: ${ctx.fileName}`
    ];
    if (ctx.node) {
        lines.push(`# stage: ${token(ctx.node.linkName, ctx.node.id)} (${ctx.node.type})`);
    }
    if (ctx.nodeInfo) {
        lines.push(`# block: ${ctx.nodeInfo.label}`);
    }
    const links = linkSummary(project, safeProcessor);
    if (links.length > 0) {
        lines.push(`# links: ${links.join(', ')}`);
    }
    if (blocks.length === 0) {
        lines.push('# empty processor');
    } else {
        lines.push(...compileBlockList(blocks, ctx, 0));
    }

    return {
        id: safeProcessor.id || `processor-${processorIndex + 1}`,
        name: token(safeProcessor.name, `processor ${processorIndex + 1}`),
        stageNodeId: safeProcessor.stageNodeId,
        fileName: ctx.fileName,
        worldProcessor: ctx.worldProcessor,
        blockCount: blocks.length,
        linkCount: Array.isArray(safeProcessor.links) ? safeProcessor.links.length : 0,
        code: lines.join('\n').trimEnd(),
        diagnostics: ctx.diagnostics
    };
};

export const compileProject = projectSnapshot => {
    const project = normalizeProject(projectSnapshot);
    const diagnostics = [];

    if (project.processors.length === 0) {
        diagnostics.push({
            level: 'error',
            message: '项目中没有逻辑处理器。',
            source: 'compiler'
        });
        return {
            ok: false,
            code: '',
            processors: [],
            diagnostics
        };
    }

    const processors = project.processors.map((processor, index) => {
        const result = compileProcessor(project, processor, index);
        diagnostics.push(...result.diagnostics);
        return result;
    });

    return {
        ok: !diagnostics.some(item => item.level === 'error'),
        code: processors.map(item => item.code).join('\n\n').trimEnd(),
        processors,
        diagnostics
    };
};

export const serializeProject = projectSnapshot => JSON.stringify(projectSnapshot, null, 2);

export default {
    compileProject,
    serializeProject
};
