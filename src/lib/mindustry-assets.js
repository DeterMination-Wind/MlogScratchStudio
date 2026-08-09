import logicProcessorIcon from '../assets/mindustry/blocks/logic/logic-processor.png';
import hyperProcessorIcon from '../assets/mindustry/blocks/logic/hyper-processor.png';
import microProcessorIcon from '../assets/mindustry/blocks/logic/micro-processor.png';
import worldProcessorIcon from '../assets/mindustry/blocks/logic/world-processor.png';
import memoryCellIcon from '../assets/mindustry/blocks/logic/memory-cell.png';
import memoryBankIcon from '../assets/mindustry/blocks/logic/memory-bank.png';
import worldCellIcon from '../assets/mindustry/blocks/logic/world-cell.png';
import messageIcon from '../assets/mindustry/blocks/logic/message.png';
import reinforcedMessageIcon from '../assets/mindustry/blocks/logic/reinforced-message.png';
import worldMessageIcon from '../assets/mindustry/blocks/logic/world-message.png';
import switchIcon from '../assets/mindustry/blocks/logic/switch.png';
import switchOnIcon from '../assets/mindustry/blocks/logic/switch-on.png';
import worldSwitchIcon from '../assets/mindustry/blocks/logic/world-switch.png';
import worldSwitchOnIcon from '../assets/mindustry/blocks/logic/world-switch-on.png';
import logicDisplayIcon from '../assets/mindustry/blocks/logic/logic-display.png';
import largeLogicDisplayIcon from '../assets/mindustry/blocks/logic/large-logic-display.png';

export const mindustryLogicIcons = {
    logicProcessor: logicProcessorIcon,
    hyperProcessor: hyperProcessorIcon,
    microProcessor: microProcessorIcon,
    worldProcessor: worldProcessorIcon,
    memoryCell: memoryCellIcon,
    memoryBank: memoryBankIcon,
    worldCell: worldCellIcon,
    message: messageIcon,
    reinforcedMessage: reinforcedMessageIcon,
    worldMessage: worldMessageIcon,
    switch: switchIcon,
    switchOn: switchOnIcon,
    worldSwitch: worldSwitchIcon,
    worldSwitchOn: worldSwitchOnIcon,
    logicDisplay: logicDisplayIcon,
    largeLogicDisplay: largeLogicDisplayIcon
};

export const stageBlockTypes = {
    'logic-processor': {
        category: 'processors',
        icon: logicProcessorIcon,
        label: '逻辑处理器',
        processor: true,
        range: 176,
        size: {w: 2, h: 2},
        stem: 'logic'
    },
    'hyper-processor': {
        category: 'processors',
        icon: hyperProcessorIcon,
        label: '超速处理器',
        processor: true,
        range: 336,
        size: {w: 3, h: 3},
        stem: 'hyper'
    },
    'micro-processor': {
        category: 'processors',
        icon: microProcessorIcon,
        label: '微型处理器',
        processor: true,
        range: 80,
        size: {w: 1, h: 1},
        stem: 'micro'
    },
    'world-processor': {
        category: 'processors',
        icon: worldProcessorIcon,
        label: '世界处理器',
        processor: true,
        range: Number.POSITIVE_INFINITY,
        size: {w: 1, h: 1},
        stem: 'world'
    },
    'memory-cell': {
        category: 'memory',
        icon: memoryCellIcon,
        label: '内存元',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'cell'
    },
    'memory-bank': {
        category: 'memory',
        icon: memoryBankIcon,
        label: '内存库',
        processor: false,
        size: {w: 2, h: 2},
        stem: 'bank'
    },
    'world-cell': {
        category: 'memory',
        icon: worldCellIcon,
        label: '世界内存元',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'worldcell'
    },
    message: {
        category: 'io',
        icon: messageIcon,
        label: '消息板',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'message'
    },
    'reinforced-message': {
        category: 'io',
        icon: reinforcedMessageIcon,
        label: '加固消息板',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'rmessage'
    },
    'world-message': {
        category: 'io',
        icon: worldMessageIcon,
        label: '世界消息板',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'worldmessage'
    },
    switch: {
        category: 'logic',
        icon: switchIcon,
        label: '开关',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'switch'
    },
    'switch-on': {
        category: 'logic',
        icon: switchOnIcon,
        label: '开关(开)',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'switchon'
    },
    'world-switch': {
        category: 'logic',
        icon: worldSwitchIcon,
        label: '世界开关',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'worldswitch'
    },
    'world-switch-on': {
        category: 'logic',
        icon: worldSwitchOnIcon,
        label: '世界开关(开)',
        processor: false,
        size: {w: 1, h: 1},
        stem: 'worldswitchon'
    },
    'logic-display': {
        category: 'display',
        icon: logicDisplayIcon,
        label: '逻辑显示器',
        processor: false,
        size: {w: 3, h: 3},
        stem: 'display'
    },
    'large-logic-display': {
        category: 'display',
        icon: largeLogicDisplayIcon,
        label: '大型逻辑显示器',
        processor: false,
        size: {w: 6, h: 6},
        stem: 'largedisplay'
    }
};

export const stageToolOrder = [
    'logic-processor',
    'hyper-processor',
    'micro-processor',
    'world-processor',
    'memory-cell',
    'memory-bank',
    'world-cell',
    'message',
    'reinforced-message',
    'world-message',
    'switch',
    'switch-on',
    'world-switch',
    'world-switch-on',
    'logic-display',
    'large-logic-display'
];
