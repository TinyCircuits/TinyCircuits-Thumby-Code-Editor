
Blockly.Msg.FLOW_HUE = 70;
Blockly.Msg.ADVANCED_HUE = 0;
Blockly.Msg.BUTTON_HUE = 15;
Blockly.Msg.GRAPHICS_HUE = 30;
Blockly.Msg.AUDIO_HUE = 45;
Blockly.Msg.SAVES_HUE = Blockly.Msg.VARIABLES_HUE;

// Overide Blockly's copy and paste so you can copy and paste from one
// tab to another.
var _blcpBuf;
var _blcp = Blockly.ShortcutRegistry.registry.getRegistry()["copy"];
_blcp.callback = (workspace, e) => {
  e.preventDefault();
  workspace.hideChaff();
  _blcpBuf = Blockly.common.getSelected().toCopyData();
};
Blockly.ShortcutRegistry.registry.register(_blcp, opt_allowOverrides=true);
_blcp = Blockly.ShortcutRegistry.registry.getRegistry()["paste"];
_blcp.callback = (workspace) => {
  if (!_blcpBuf) {return false}
  workspace = workspace.isFlyout ? workspace.targetWorkspace : workspace;
  return !!(workspace.paste(_blcpBuf.saveInfo));
};
Blockly.ShortcutRegistry.registry.register(_blcp, opt_allowOverrides=true);

// Fix anything Blockly did that wouldn't work for MicroPython
function blockly_fix_for_micropython(code){
  return code.replace("from numbers import Number\n", "Number = int\n");
}

const PY = Blockly.Python;
const NM = Blockly.Names;
const VAR = Blockly.Variables;
const EX = Blockly.Extensions;

var _blscratch = document.createElement('canvas');

var blocklyToolbox = {
  "contents": [
    {
      "name": "Logic",
      "kind": "CATEGORY", "categorystyle": "logic_category",
      "contents": [
        {"type": "controls_if", "kind": "BLOCK"},
        {"type": "logic_compare", "kind": "BLOCK"},
        {"type": "logic_operation", "kind": "BLOCK"},
        {"type": "logic_negate", "kind": "BLOCK"},
        {"type": "logic_boolean", "kind": "BLOCK"},
        {"type": "logic_null", "kind": "BLOCK"},
        {"type": "logic_ternary", "kind": "BLOCK"}
      ]
    },
    {
      "name": "Loops",
      "kind": "CATEGORY", "categorystyle": "loop_category",
      "contents": [
        {"type": "controls_repeat_ext", "kind": "BLOCK", "inputs": {
          "TIMES": {"shadow": {"type": "math_number", "fields": {"NUM": 10}}}},
        },
        {"type": "controls_whileUntil", "kind": "BLOCK"},
        {"type": "controls_for", "kind": "BLOCK", "inputs": {
          "FROM": {"shadow": {"type": "math_number", "fields": {"NUM": 10}}},
          "TO": {"shadow": {"type": "math_number", "fields": {"NUM": 10}}},
          "BY": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}}},
        },
        {"type": "controls_forEach", "kind": "BLOCK"},
        {"type": "controls_flow_statements", "kind": "BLOCK"}
      ]
    },
    {
      "name": "Math",
      "kind": "CATEGORY", "categorystyle": "math_category", "contents": [
        {"type": "math_number", "kind": "BLOCK", "fields": {"NUM": 123}},
        {"type": "math_arithmetic", "kind": "BLOCK", "inputs": {
          "A": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}},
          "B": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}}},
        },
        {"type": "math_single", "kind": "BLOCK", "inputs": {
          "NUM": {"shadow": {"type": "math_number", "fields": {"NUM": 9}}}},
        },
        {"type": "math_trig", "kind": "BLOCK", "inputs": {
          "NUM": {"shadow": {"type": "math_number", "fields": {"NUM": 45}}}},
        },
        {"type": "math_constant", "kind": "BLOCK"},
        {"type": "math_number_property", "kind": "BLOCK", "inputs": {
          "NUMBER_TO_CHECK": {"shadow": {"type": "math_number", "fields": {"NUM": 0}}}},
        },
        {"type": "math_round", "kind": "BLOCK", "inputs": {
          "NUM": {"shadow": {"type": "math_number", "fields": {"NUM": 3.1}}}},
        },
        {"type": "math_on_list", "kind": "BLOCK"},
        {"type": "math_modulo", "kind": "BLOCK", "inputs": {
          "DIVIDEND": {"shadow": {"type": "math_number", "fields": {"NUM": 61}}},
          "DIVISOR": {"shadow": {"type": "math_number", "fields": {"NUM": 10}}}},
        },
        {"type": "math_constrain", "kind": "BLOCK", "inputs": {
          "VALUE": {"shadow": {"type": "math_number", "fields": {"NUM": 50}}},
          "LOW": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}},
          "HIGH": {"shadow": {"type": "math_number", "fields": {"NUM": 100}}}},
        },
        {"type": "math_random_int", "kind": "BLOCK", "inputs": {
          "FROM": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}},
          "TO": {"shadow": {"type": "math_number", "fields": {"NUM": 10}}}},
        },
        {"type": "math_random_float", "kind": "BLOCK"},
        {"type": "var_to_int", "kind": "BLOCK"},
        {"type": "var_to_float", "kind": "BLOCK"},
      ]
    },
    {
      "name": "Text",
      "kind": "CATEGORY", "categorystyle": "text_category",
      "contents": [
        {"type": "text_print", "kind": "BLOCK"},
        {"type": "text", "kind": "BLOCK", "fields": {"TEXT": "abc"}},
        {"type": "text_multiline", "kind": "BLOCK", "fields": {"TEXT": "abc\ndef"}},
        {"type": "text_join", "kind": "BLOCK"},
        {"type": "text_append", "kind": "BLOCK", "inputs": {
          "TEXT": {"shadow": {"type": "text", "fields": {"TEXT": "abc"}}}},
        },
        {"type": "text_length", "kind": "BLOCK", "inputs": {
          "VALUE": {"shadow": {"type": "text", "fields": {"TEXT": "abc"}}}},
        },
        {"type": "text_isEmpty", "kind": "BLOCK", "inputs": {
          "VALUE": {"shadow": {"type": "text", "fields": {"TEXT": "abc"}}}},
        },
        {"type": "text_indexOf", "kind": "BLOCK", "inputs": {
          "FIND": {"shadow": {"type": "text", "fields": {"TEXT": "abc"}}}},
        },
        {"type": "text_charAt", "kind": "BLOCK"},
        {"type": "text_getSubstring", "kind": "BLOCK"},
        {"type": "text_changeCase", "kind": "BLOCK"},
        {"type": "text_trim", "kind": "BLOCK"},
        {"type": "text_count", "kind": "BLOCK", "inputs": {
          "SUB": {"shadow": {"type": "text", "fields": {"TEXT": "abc"}}}},
        },
        {"type": "text_replace", "kind": "BLOCK", "inputs": {
          "FROM": {"shadow": {"type": "text", "fields": {"TEXT": "abc"}}},
          "TO": {"shadow": {"type": "text", "fields": {"TEXT": "def"}}}},
        },
        {"type": "text_reverse", "kind": "BLOCK"},
        {"type": "var_to_str", "kind": "BLOCK"},
      ]
    },
    {
      "name": "Lists",
      "kind": "CATEGORY",
      "categorystyle": "list_category",
      "contents": [
        {"type": "lists_create_empty", "kind": "BLOCK"},
        {"type": "lists_create_with", "kind": "BLOCK"},
        {"type": "lists_repeat", "kind": "BLOCK", "inputs": {
          "NUM": {"shadow": {"type": "math_number", "fields": {"NUM": 5}}}},
        },
        {"type": "lists_length", "kind": "BLOCK"},
        {"type": "lists_isEmpty", "kind": "BLOCK"},
        {"type": "lists_indexOf", "kind": "BLOCK"},
        {"type": "lists_getIndex", "kind": "BLOCK"},
        {"type": "lists_setIndex", "kind": "BLOCK"},
        {"type": "lists_getSublist", "kind": "BLOCK"},
        {"type": "lists_split", "kind": "BLOCK", "inputs": {
          "DELIM": {"shadow": {"type": "text", "fields": {"TEXT": ","}}}},
        },
        {"type": "lists_sort", "kind": "BLOCK"},
        {"type": "lists_reverse", "kind": "BLOCK"}
      ],
    },
    {"kind": "SEP"},
    {
      "name": "Variables",
      "kind": "CATEGORY", "categorystyle": "variable_category",
      "custom": "VARIABLE"
    },
    {
      "name": "Functions",
      "kind": "CATEGORY", "categorystyle": "procedure_category",
      "custom": "PROCEDURE"
    },
    {
      "name": "Flow",
      "kind": "CATEGORY", "colour": "%{BKY_FLOW_HUE}",
      "custom": "FLOW"
    },
    {"kind": "SEP"},
    {
      "name": "Buttons",
      "kind": "CATEGORY", "colour": "%{BKY_BUTTON_HUE}",
      "contents": [
        {"type": "button_pressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonL.pressed"}},
        {"type": "button_pressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonR.pressed"}},
        {"type": "button_pressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonU.pressed"}},
        {"type": "button_pressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonD.pressed"}},
        {"type": "button_pressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonB.pressed"}},
        {"type": "button_pressed", "kind": "BLOCK", "fields": {"BUTTON": "buttonA.pressed"}},
        {"type": "button_justPressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonL.justPressed"}},
        {"type": "button_justPressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonR.justPressed"}},
        {"type": "button_justPressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonU.justPressed"}},
        {"type": "button_justPressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonD.justPressed"}},
        {"type": "button_justPressed", "kind": "BLOCK", "gap": "2", "fields": {"BUTTON": "buttonB.justPressed"}},
        {"type": "button_justPressed", "kind": "BLOCK", "fields": {"BUTTON": "buttonA.justPressed"}},
      ]
    },
    {
      "name": "Graphics",
      "kind": "CATEGORY", "colour": "%{BKY_GRAPHICS_HUE}",
      "contents": [
        {"type": "print_to_display", "kind": "BLOCK"},
        {"type": "display_drawing", "kind": "BLOCK"},
        {"type": "drawFill", "kind": "BLOCK", "gap": "2"},
        {"type": "drawPixel", "kind": "BLOCK", "gap": "2", "inputs": {
          "X": {"shadow": {"type": "math_number", "fields": {"NUM": 0}}},
          "Y": {"shadow": {"type": "math_number", "fields": {"NUM": 0}}}}},
        {"type": "drawText", "kind": "BLOCK", "gap": "2", "inputs": {
          "VAL": {"shadow": {"type": "text", "fields": {"TEXT": "Hello World"}}},
          "X": {"shadow": {"type": "math_number", "fields": {"NUM": 0}}},
          "Y": {"shadow": {"type": "math_number", "fields": {"NUM": 0}}}}},
        {"type": "drawLine", "kind": "BLOCK", "gap": "2", "inputs": {
          "X": {"shadow": {"type": "math_number", "fields": {"NUM": 0}}},
          "Y": {"shadow": {"type": "math_number", "fields": {"NUM": 0}}},
          "X2": {"shadow": {"type": "math_number", "fields": {"NUM": 20}}},
          "Y2": {"shadow": {"type": "math_number", "fields": {"NUM": 10}}}}},
        {"type": "drawRectangle", "kind": "BLOCK", "gap": "2", "inputs": {
          "X": {"shadow": {"type": "math_number", "fields": {"NUM": 40}}},
          "Y": {"shadow": {"type": "math_number", "fields": {"NUM": 20}}},
          "X2": {"shadow": {"type": "math_number", "fields": {"NUM": 8}}},
          "Y2": {"shadow": {"type": "math_number", "fields": {"NUM": 5}}}}},
        {"type": "send_drawn_frame_to_display", "kind": "BLOCK",
          "next": {"block": {"type": "drawFill"}}},
        {"type": "setFPS", "kind": "BLOCK", "gap": "2", "inputs": {
          "FPS": {"shadow": {"type": "math_number", "fields": {"NUM": 30}}}}},
        {"type": "getFPS", "kind": "BLOCK"},
        {"type": "setFont", "kind": "BLOCK", "gap": "2"},
        {"type": "setFont_with_sprite", "kind": "BLOCK", "gap": "2"},
        {"type": "setFont_gap", "kind": "BLOCK"},
        {"type": "get_drawn_pixel", "kind": "BLOCK"},
      ]
    },
    {
      "name": "Sprites",
      "kind": "CATEGORY", "colour": "%{BKY_GRAPHICS_HUE}",
      "custom": "SPRITES"
    },
    {
      "name": "Audio",
      "kind": "CATEGORY", "colour": "%{BKY_AUDIO_HUE}",
      "contents": [
        {"type": "audio_playBlocking", "kind": "BLOCK", "inputs": {
          "FREQ": {"shadow": {"type": "math_number", "fields": {"NUM": 2000}}},
          "DURATION": {"shadow": {"type": "math_number", "fields": {"NUM": 1000}}}}},
        {"type": "audio_play", "kind": "BLOCK", "gap": "2", "inputs": {
          "FREQ": {"shadow": {"type": "math_number", "fields": {"NUM": 2000}}},
          "DURATION": {"shadow": {"type": "math_number", "fields": {"NUM": 1000}}}}},
        {"type": "audio_stop", "kind": "BLOCK"},
      ]
    },
    {
      "name": "Saves",
      "kind": "CATEGORY", "colour": "%{BKY_SAVES_HUE}",
      "contents": [
        {"text": "Note: saves won't persist in the emulator.", "kind": "label"},
        {"type": "saves_setItem", "kind": "BLOCK", "inputs": {
          "VALUE": {"shadow": {"type": "math_number", "fields": {"NUM": 99}}}}},
        {"type": "saves_getItem", "kind": "BLOCK"},
        {"type": "saves_hasItem", "kind": "BLOCK"},
        {"type": "saves_delItem", "kind": "BLOCK"},
      ]
    },
    {
      "name": "Hardware",
      "kind": "CATEGORY", "colour": "%{BKY_ADVANCED_HUE}",
      "contents": [
        {"type": "set_freq", "kind": "BLOCK"},
        {"type": "get_freq", "kind": "BLOCK"},
        {"type": "reset", "kind": "BLOCK"},
        {"type": "lightsleep", "kind": "BLOCK", "inputs": {
          "TIME": {"shadow": {"type": "math_number", "fields": {"NUM": 1000}}}},
        },
        {"type": "brightness", "kind": "BLOCK", "inputs": {
          "VAL": {"shadow": {"type": "math_number", "fields": {"NUM": 127}}}},
        },
        {"type": "screen_dimensions", "kind": "BLOCK"},
      ]
    },
    {"kind": "SEP"},
    {
      "name": "Advanced",
      "kind": "CATEGORY", "colour": "%{BKY_ADVANCED_HUE}",
      "contents": [
        {"type": "exec_python", "kind": "BLOCK", "inputs": {
          "command": {"shadow": {"type": "text_multiline", "fields": {"TEXT": ""}}}},
        },
        {"type": "exec_python_output", "kind": "BLOCK", "inputs": {
          "command": {"shadow": {"type": "text", "fields": {"TEXT": ""}}}},
        },
        {"type": "python_try_catch", "kind": "BLOCK"},
        {"type": "gc_collect", "kind": "BLOCK"},
      ]
    },
  ]
};

function blocklyRegister(workspace) {

  workspace.registerToolboxCategoryCallback(
    'FLOW', (workspace)=>{
      const timers = workspace.getVariablesOfType('Timer');
      var blocks = [
          {"type": "wait", "kind": "BLOCK", "inputs": {
            "TIME": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}}},
          },
          {"type": "ticks_ms", "kind": "BLOCK"},
          {"type": "ticks_diff", "kind": "BLOCK"},
          {"type": "timer", "kind": "BLOCK", "gap": timers ? "2" : "8"},
        ];
      timers.forEach((timer)=>{blocks.push({"type": "stop_timer",
        "kind": "BLOCK", "gap": "2", "fields": {"VAR": timer}})});
      return blocks;
    }
  );

  workspace.registerToolboxCategoryCallback(
    'SPRITES', (workspace)=>{
      const defaultData = `# BITMAP: width: 32, height: 32
bitmap0 = bytearray([0,0,0,0,0,0,0,0,248,8,232,40,40,40,40,40,40,40,40,40,40,232,8,248,0,0,0,0,0,0,0,
                     0,0,0,0,0,0,0,0,0,255,0,63,32,32,32,32,32,32,32,32,32,32,63,0,255,0,0,0,0,0,0,0,
                     0,0,0,0,0,0,0,0,0,255,0,12,12,63,63,12,12,0,0,24,24,3,3,0,255,0,0,0,0,0,0,0,0,0,
                     0,0,0,0,0,0,0,31,16,16,16,16,20,18,16,20,18,16,16,16,16,16,31,0,0,0,0,0,0,0,0])`;
      const sprites = workspace.getVariablesOfType('Sprite');
      const dsp = sprites.length ? {"VAR": sprites[0]} : {};
      const mskdsp = {...dsp, ...(sprites.length > 1 ? {"MSK": sprites[1]} : {})};
      var blocks = [
          {"type": "load_sprite", "kind": "BLOCK", "gap": "2", "data": defaultData},
          {"type": "set_transparency", "kind": "BLOCK", "fields": {...dsp}},
          {"type": "drawSprite", "kind": "BLOCK", "gap": "2", "fields": {...dsp}},
          {"type": "drawSpriteWithMask", "kind": "BLOCK", "gap": "2", "fields": {...mskdsp}},
          {"type": "send_drawn_frame_to_display", "kind": "BLOCK",
            "next": {"block": {"type": "drawFill"}}},
          {"type": "move_x_to", "kind": "BLOCK", "gap": "2", "fields": {...dsp}, "inputs": {
            "V": {"shadow": {"type": "math_number", "fields": {"NUM": 30}}}}},
          {"type": "move_y_to", "kind": "BLOCK", "gap": "2", "fields": {...dsp}, "inputs": {
            "V": {"shadow": {"type": "math_number", "fields": {"NUM": 20}}}}},
          {"type": "move_x_by", "kind": "BLOCK", "gap": "2", "fields": {...dsp}, "inputs": {
            "V": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}}}},
          {"type": "move_y_by", "kind": "BLOCK", "gap": "2", "fields": {...dsp}, "inputs": {
            "V": {"shadow": {"type": "math_number", "fields": {"NUM": -1}}}}},
          {"type": "flip", "kind": "BLOCK", "gap": "2", "fields": {...dsp}},
          {"type": "mirror", "kind": "BLOCK", "fields": {...dsp}},
          {"type": "get_sprite_size", "kind": "BLOCK", "gap": "2", "fields": {...dsp}},
          {"type": "get_sprite_orien", "kind": "BLOCK", "gap": "2", "fields": {...dsp}},
          {"type": "get_sprite_frame", "kind": "BLOCK", "fields": {...dsp}},
          {"type": "sprite_to_var", "kind": "BLOCK", "fields": {...dsp}, "gap": "2"},
          {"type": "var_to_sprite", "kind": "BLOCK", "fields": {...dsp}},
          {"type": "setFrame", "kind": "BLOCK", "gap": "2", "fields": {...dsp}, "inputs": {
            "FRM": {"shadow": {"type": "math_number", "fields": {"NUM": 1}}}}},
          {"type": "load_anim_sprite", "kind": "BLOCK", "gap": "2", "data": defaultData},
        ];
      sprites.forEach((sprite)=>{blocks.unshift({"type": "load_sprite",
        "data": defaultData, "kind": "BLOCK", "gap": "2", "fields": {"VAR": sprite}})});
      sprites.reverse().forEach((sprite)=>{blocks.push({"type": "load_anim_sprite",
        "data": defaultData, "kind": "BLOCK", "gap": "2", "fields": {"VAR": sprite}})});
      return blocks;
    }
  );
}

Blockly.defineBlocksWithJsonArray([
  {
    "type": "ticks_diff",
    "message0": 'time from %2 to %1',
    "args0": [
      {"name": "end", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "start", "type": "input_value", "check": "Number", "align": "RIGHT"}
    ],
    "output": "Number",
    "colour": "%{BKY_FLOW_HUE}",
    "tooltip": "Compute time difference."
  },
  {
    "type": "ticks_ms",
    "message0": 'time (ms)',
    "output": "Number",
    "colour": "%{BKY_FLOW_HUE}",
    "tooltip": "Get millisecond counter."
  },
  {
    "type": "wait",
    "message0": 'wait %1 %2',
    "args0": [
      {"name": "TIME", "type": "input_value", "check": "Number"},
      {"name": "SCALE", "type": "field_dropdown", "options":
        [["seconds","sleep"], ["milliseconds","sleep_ms"], ["microseconds","sleep_us"]]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_FLOW_HUE}",
    "tooltip": "Delay for a given amount of time."
  },
  {
    "type": "timer",
    "message0": 'timer %1 do %2 %3 ms',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Timer"], "defaultType": "Timer"},
      {"name": "MODE", "type": "field_dropdown", "options":
        [["every","PERIODIC"], ["once in","ONE_SHOT"]]},
      {"name": "INTERVAL", "type": "field_number", "value": 1000, "min": 0},
    ],
    "message1": '%1',
    "args1": [
      {"name": "STACK", "type": "input_statement"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_FLOW_HUE}",
    "extensions": ["del_vars_context_menu"],
    "tooltip": "Set a Timer to execute periodically or once after a time given in milliseconds."
  },
  {
    "type": "stop_timer",
    "message0": 'stop %1',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Timer"], "defaultType": "Timer"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_FLOW_HUE}",
    "extensions": ["del_vars_context_menu"],
    "tooltip": "Stop a timer."
  },
  {
    "type": "reset",
    "message0": 'reset',
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Reset device."
  },
  {
    "type": "set_freq",
    "message0": 'set core frequency %1 Hz',
    "args0": [
      {"name": "freq", "type": "field_number", "value": 125000000, "min": 10000, "max": 250000000},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Set CPU clock frequency."
  },
  {
    "type": "get_freq",
    "message0": 'core freqeuency',
    "output": "Number",
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Get CPU clock frequency."
  },
  {
    "type": "lightsleep",
    "message0": 'lightsleep for %1 ms',
    "args0": [
      {"name": "TIME", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Wait for a given time in a low power state."
  },
  {
    "type": "brightness",
    "message0": 'set brightness to %1',
    "args0": [
      {"name": "VAL", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Change the brightness of the display (0-127)."
  },
  {
    "type": "screen_dimensions",
    "message0": 'get screen %1',
    "args0": [
      {"name": "DIM", "type": "field_dropdown", "options":
        [["width","width"], ["height","height"]]},
    ],
    "output": "Number",
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Get the width or height of the screen in pixels."
  },
  {
    "type": "exec_python",
    "message0": 'run Python %1',
    "args0": [
      {"name": "command", "type": "input_value", "check": "String"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Execute custom Python code."
  },
  {
    "type": "exec_python_output",
    "message0": 'evaluate Python %1',
    "args0": [
      {"name": "command", "type": "input_value", "check": "String"},
    ],
    "output": "Number",
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Evaluate custom Python code returning the result."
  },
  {
    "type": "python_try_catch",
    "message0": 'try %1',
    "args0": [
      {"name": "try", "type": "input_statement", "align": "RIGHT"},
    ],
    "message1": 'catch %1',
    "args1": [
      {"name": "catch", "type": "input_statement", "align": "RIGHT"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Python try/except clause for catching exceptions."
  },
  {
    "type": "gc_collect",
    "message0": 'trigger garbage collection',
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_ADVANCED_HUE}",
    "tooltip": "Scan for and free memory that is no longer needed."
  },
  {
    "type": "var_to_str",
    "message0": 'to text %1',
    "args0": [
      {"name": "var", "type": "input_value"},
    ],
    "output": "String",
    "colour": "%{BKY_TEXTS_HUE}",
    "tooltip": "Convert anything to text."
  },
  {
    "type": "var_to_int",
    "message0": 'to int %1',
    "args0": [
      {"name": "var", "type": "input_value"},
    ],
    "output": "Number",
    "colour": "%{BKY_MATH_HUE}",
    "tooltip": "Convert anything to text."
  },
  {
    "type": "var_to_float",
    "message0": 'to float %1',
    "args0": [
      {"name": "var", "type": "input_value"},
    ],
    "output": "Number",
    "colour": "%{BKY_MATH_HUE}",
    "tooltip": "Convert anything to text."
  },
  {
    "type": "button_pressed",
    "message0": '%1 held',
    "args0": [
      {"name": "BUTTON", "type": "field_dropdown", "options": [
        ["left", "buttonL.pressed"], ["right", "buttonR.pressed"],
        ["up", "buttonU.pressed"], ["down", "buttonD.pressed"],
        ["button B", "buttonB.pressed"], ["button A", "buttonA.pressed"],
        ["any input", "inputPressed"], ["dpad", "dpadPressed"],
        ["button A or B", "actionPressed"]]}
    ],
    "output": "Boolean",
    "colour": "%{BKY_BUTTON_HUE}",
    "tooltip": "Detect if a button is currently held down."
  },
  {
    "type": "button_justPressed",
    "message0": '%1 hit',
    "args0": [
      {"name": "BUTTON", "type": "field_dropdown", "options": [
        ["left", "buttonL.justPressed"], ["right", "buttonR.justPressed"],
        ["up", "buttonU.justPressed"], ["down", "buttonD.justPressed"],
        ["button B", "buttonB.justPressed"], ["button A", "buttonA.justPressed"],
        ["any input", "inputJustPressed"], ["dpad", "dpadJustPressed"],
        ["button A or B", "actionJustPressed"]]}
    ],
    "output": "Boolean",
    "colour": "%{BKY_BUTTON_HUE}",
    "tooltip": "Detect if a button was pressed down."
  },
  {
    "type": "audio_play",
    "message0": 'sound %1 Hz for %2 ms',
    "args0": [
      {"name": "FREQ", "type": "input_value", "check": "Number"},
      {"name": "DURATION", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_AUDIO_HUE}",
    "tooltip": "Plays audio sound frequency for a duration in the background."
  },
  {
    "type": "audio_playBlocking",
    "message0": 'sound %1 Hz and wait for %2 ms',
    "args0": [
      {"name": "FREQ", "type": "input_value", "check": "Number"},
      {"name": "DURATION", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_AUDIO_HUE}",
    "tooltip": "Plays audio sound frequency for a duration and waits for audio to finish."
  },
  {
    "type": "audio_stop",
    "message0": 'stop sound',
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_AUDIO_HUE}",
    "tooltip": "Stops playing any audio started by 'play sound...'."
  },
  {
    "type": "saves_setItem",
    "message0": 'save %1 : %2',
    "args0": [
      {"name": "KEY", "type": "field_input", "text": "high score"},
      {"name": "VALUE", "type": "input_value"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_SAVES_HUE}",
    "tooltip": "Sets a game save value."
  },
  {
    "type": "saves_getItem",
    "message0": 'get %1',
    "args0": [
      {"name": "KEY", "type": "field_input", "text": "high score"},
    ],
    "output": "String",
    "colour": "%{BKY_SAVES_HUE}",
    "tooltip": "Retrieves a game save value."
  },
  {
    "type": "saves_hasItem",
    "message0": 'is %1 set',
    "args0": [
      {"name": "KEY", "type": "field_input", "text": "high score"},
    ],
    "output": "Boolean",
    "colour": "%{BKY_SAVES_HUE}",
    "tooltip": "Checks whether a game save entry has a value."
  },
  {
    "type": "saves_delItem",
    "message0": 'clear %1',
    "args0": [
      {"name": "KEY", "type": "field_input", "text": "high score"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_SAVES_HUE}",
    "tooltip": "Deletes the entry for a game save value."
  },
  {
    "type": "text_print",
    "message0": 'print to debug shell %1',
    "args0": [
      {"name": "TEXT", "type": "input_value"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_TEXTS_HUE}",
    "tooltip": "Print the specified text, number or other value to the debug Shell Tab in the Editor."
  },
  {
    "type": "print_to_display",
    "message0": 'print to display %1',
    "args0": [
      {"name": "VAL", "type": "input_value"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Print text or other data directly to the Thumby display."
  },
  {
    "type": "send_drawn_frame_to_display",
    "message0": 'send drawn frame to display',
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Loads the drawn frame to the display, " +
      "then briefly pauses until the next frame time. " +
      " Use [draw ...] blocks for drawing.",
    "next": {"block":{"type":"drawFill"}}
  },
  {
    "type": "drawPixel",
    "message0": 'draw %1 pixel at x%2y%3',
    "args0": [
      {"name": "COL", "type": "field_dropdown", "options":
        [["white","1"], ["black","0"]]},
      {"name": "X", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "Y", "type": "input_value", "check": "Number", "align": "RIGHT"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Draws a pixel (on the next frame) at an x,y coordinate. " +
      "Display the frame to screen with: [send drawn frame to display]"
  },
  {
    "type": "drawText",
    "message0": 'draw %1 %4 text at x%2y%3',
    "args0": [
      {"name": "COL", "type": "field_dropdown", "options":
        [["white","1"], ["black","0"]]},
      {"name": "X", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "Y", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "VAL", "type": "input_value"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "On the next frame, draws text from a top-left position. " +
      "Display the frame to screen with: [send drawn frame to display]"
  },
  {
    "type": "drawLine",
    "message0": 'draw %1',
    "args0": [
      {"name": "COL", "type": "field_dropdown", "options":
        [["white","1"], ["black","0"]]},
    ],
    "message1": 'line from x%1y%2 to x%3y%4',
    "args1": [
      {"name": "X", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "Y", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "X2", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "Y2", "type": "input_value", "check": "Number", "align": "RIGHT"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Draws a line (on the next frame) from one point to another. " +
      "Display the frame to screen with: [send drawn frame to display]"
  },
  {
    "type": "drawRectangle",
    "message0": 'draw %1',
    "args0": [
      {"name": "COL", "type": "field_dropdown", "options":
        [["white","1"], ["black","0"]]},
    ],
    "message1": '%1 at x%2y%3 width%4 height%5',
    "args1": [
      {"name": "SHAPE", "type": "field_dropdown", "options":
        [["rectangle","Rectangle"], ["filled rectangle","FilledRectangle"]]},
      {"name": "X", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "Y", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "X2", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "Y2", "type": "input_value", "check": "Number", "align": "RIGHT"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Draws a rectangle (on the next frame) with top-left position, " +
      "and width and height. " +
      "Display the frame to screen with: [send drawn frame to display]"
  },
  {
    "type": "drawFill",
    "message0": 'draw %1 fill',
    "args0": [
      {"name": "COL", "type": "field_dropdown", "options":
        [["black","0"], ["white","1"]]},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Clears the whole next frame. " +
      "Display the frame to screen with: [send drawn frame to display]"
  },
  {
    "type": "display_drawing",
    "message0": 'draw to display',
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Sends the drawn frame directly to the display " +
      "without waiting for the next frame time. Use [draw ...] blocks for drawing."
  },
  {
    "type": "get_drawn_pixel",
    "message0": 'get drawn pixel at x%1y%2',
    "args0": [
      {"name": "X", "type": "input_value", "check": "Number", "align": "RIGHT"},
      {"name": "Y", "type": "input_value", "check": "Number", "align": "RIGHT"},
    ],
    "output": "Boolean",
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Detect the value of the pixel drawn for the next frame: " +
      "white gives True, and black gives False."
  },
  {
    "type": "setFPS",
    "message0": 'set FPS %1',
    "args0": [
      {"name": "FPS", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Set the number of frames per second that will be sent " +
      "to the display with [send drawn frame to display]."
  },
  {
    "type": "getFPS",
    "message0": 'get FPS',
    "output": "Number",
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Get the number of frames per second currently set."
  },
  {
    "type": "setFont",
    "message0": 'set font %1',
    "args0": [
      {"name": "FONT", "type": "field_dropdown", "options": [
        ["TC-3x5","TC-3x5"],
        ["TC-5x7","TC-5x7"],
        ["TC-8x8","TC-8x8"]]},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Set the font to use when drawing to the display."
  },
  {
    "type": "setFont_with_sprite",
    "message0": 'set %2x%3 font with sprite %1',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "W", "type": "field_number", "value": 5, "min": 1},
      {"name": "H", "type": "field_number", "value": 7, "min": 1, "max": 8},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Set the font from a Sprite to use when drawing to the display."
  },
  {
    "type": "setFont_gap",
    "message0": 'set font gap %1',
    "args0": [
      {"name": "GAP", "type": "field_number", "value": 1, "min": 0},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Set the horizontal spacing between each character of drawn text."
  },
  {
    "type": "load_sprite",
    "message0": '%1 load sprite %2',
    "args0": [
      {"name": "IMG", "type": "field_image", "width": 50, "height": 30,
        "src": "favicon.png"},
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "extensions": ["del_vars_context_menu", "update_image_from_sprite"],
    "tooltip": "Place this block, select it, then use the " +
      "Bitmap Builder's IMPORT and EXPORT buttons to edit the Sprite image."
  },
  {
    "type": "load_anim_sprite",
    "message0": '%1 load sprite %2 with %3 frames',
    "args0": [
      {"name": "IMG", "type": "field_image", "width": 50, "height": 30,
        "src": "favicon.png"},
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "FRMS", "type": "field_number", "value": 2, "min": 1},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "extensions": ["del_vars_context_menu", "update_image_from_sprite"],
    "tooltip": "Similar to the [load sprite] block but works with sprites " +
      "composed of multiple animation frames, one after the other."
  },
  {
    "type": "drawSprite",
    "message0": 'draw %1',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Draws the Sprite (on the next frame). " +
      "Display the frame to screen with: [send drawn frame to display]"
  },
  {
    "type": "drawSpriteWithMask",
    "message0": 'draw %1 with mask %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "MSK", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Draws the Sprite with a Mask (on the next frame). " +
      "The Mask provides a transparency shape with the Mask's black pixels " +
      "applying transparency. " +
      "The Mask Sprite must be the same width and height as the drawn Sprite " +
      "otherwise it will not be displayed. " +
      "Display the frame to screen with: [send drawn frame to display]"
  },
  {
    "type": "flip",
    "message0": 'flip %1',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Flips the Sprite vertically."
  },
  {
    "type": "mirror",
    "message0": 'mirror %1',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Mirrors the Sprite left to right."
  },
  {
    "type": "get_sprite_size",
    "message0": 'get %1 %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "ATTR", "type": "field_dropdown", "options": [
        ["x position","x"], ["y position","y"],
        ["width","width"], ["height", "height"]]},
    ],
    "output": "Number",
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Gets positional and size related data from Sprite."
  },
  {
    "type": "get_sprite_orien",
    "message0": 'get %1 %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "ATTR", "type": "field_dropdown", "options": [
        ["flipped","mirrorY"], ["mirrorred", "mirrorX"]]},
    ],
    "output": "Boolean",
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Gets the mirrored or filpped state of a Sprite."
  },
  {
    "type": "move_x_to",
    "message0": 'move %1 x to %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "V", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Moves the Sprite to a new position in the horizontal direction."
  },
  {
    "type": "move_y_to",
    "message0": 'move %1 y to %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "V", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Moves the Sprite to a new position in the vertical direction."
  },
  {
    "type": "move_x_by",
    "message0": 'move %1 x by %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "V", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Moves the Sprite horizontally."
  },
  {
    "type": "move_y_by",
    "message0": 'move %1 y by %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "V", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Moves the Sprite vertically."
  },
  {
    "type": "set_transparency",
    "message0": 'set %1 transparency %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "VAL", "type": "field_dropdown", "options": [
        ["none","-1"],["black","0"],["white","1"]]},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Sets a color to be transparent."
  },
  {
    "type": "get_sprite_frame",
    "message0": 'get %1 frame number',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
    ],
    "output": "Number",
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Gets the current frame number of an animated Sprite."
  },
  {
    "type": "setFrame",
    "message0": 'set %1 frame number to %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "FRM", "type": "input_value", "check": "Number"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Sets the current frame number for an animated Sprite."
  },
  {
    "type": "sprite_to_var",
    "message0": 'var from %1',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
    ],
    "output": "Sprite",
    "colour": "%{BKY_GRAPHICS_HUE}",
    "tooltip": "Create a new Sprite in the form of a variable with all the " +
      "image, position, and orientation information copied."
  },
  {
    "type": "var_to_sprite",
    "message0": 'load %1 with var %2',
    "args0": [
      {"name": "VAR", "type": "field_variable",
        "variableTypes": ["Sprite"], "defaultType": "Sprite"},
      {"name": "SRC", "type": "field_variable"},
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_GRAPHICS_HUE}",
    "extensions": ["del_vars_context_menu"],
    "tooltip": "Load a stored sprite Variable into a Sprite for use. " +
      "Changes made to the loaded Sprite will also be made to the Variable."
  },
]);

EX.registerMixin('del_vars_context_menu', {
  customContextMenu: function (menu) {
    if (this.isInFlyout && this.type == 'timer') {return}
    var variable = this.getField("VAR").getVariable();
    menu.push({"text": `Rename ${variable.type} ${variable.name}`, "enabled": true,
      "callback": ()=>{
        VAR.renameVariable(this.workspace, variable);
    }})
    menu.push({"text": `Delete ${variable.type} ${variable.name}`, "enabled": true,
      "callback": ()=>{
        this.workspace.deleteVariableById(variable.getId());
        this.workspace.refreshToolboxSelection();
    }})
  }
});

function updateImageFromSprite(block) {
  // Build an icon for the block
  var pixData = block.data.match(
    /# BITMAP: width: (?<w>[0-9]+), height: (?<h>[0-9]+)\n.*bytearray\((?<b>[^\(\)]+)\)/).groups;
  if (pixData) {
    _blscratch.width = parseInt(pixData.w);
    _blscratch.height = parseInt(pixData.h);
    const bits = JSON.parse(pixData.b);
    var context = _blscratch.getContext('2d');
    for(var x = 0; x < _blscratch.width; x++){
        for(var y = 0; y < _blscratch.width; y++){
            context.fillStyle = (
              bits[x + (~~(y/8))*_blscratch.width] & (1<<y%8)) ? '#fff' : '#000';
            context.fillRect(x, y, 1, 1);
        }
    }
    block.setFieldValue(_blscratch.toDataURL(), "IMG");
  }
}

EX.register('update_image_from_sprite', function() {
  this.setOnChange(function(event) {
    if (event.type != Blockly.Events.FINISHED_LOADING || this.isInFlyout || !this.data) {return}
    updateImageFromSprite(this);
  });
});


PY.addReservedWords('audio,buttons,display,gc,io,machine,saveData,Sprite,time,__setFontFromBytes__,__print_to_display__');

PY['ticks_diff'] = function(block) {
  PY.definitions_['import_time'] = 'import time';
  var start = PY.valueToCode(block, 'start', PY.ORDER_NONE) || 0;
  var end = PY.valueToCode(block, 'end', PY.ORDER_NONE) || 0;
  return [`time.ticks_diff(${end}, ${start})`, PY.ORDER_FUNCTION_CALL];
};

PY['ticks_ms'] = function(block) {
  PY.definitions_['import_time'] = 'import time';
  return ['time.ticks_ms()', PY.ORDER_FUNCTION_CALL];
};

PY['wait'] = function(block) {
  PY.definitions_['import_time'] = 'import time';
  var duration = PY.valueToCode(block, 'TIME', PY.ORDER_NONE) || 0;
  var scale = block.getFieldValue('SCALE');
  return `time.${scale}(${duration})\n`;
};

PY['reset'] = function(block) {
  PY.definitions_['import_machine'] = 'import machine';
  return 'machine.reset()\n';
};

PY['set_freq'] = function(block) {
  PY.definitions_['import_machine'] = 'import machine';
  var freq = block.getFieldValue('freq');
  return `machine.freq(${freq})\n`;
};

PY['get_freq'] = function(block) {
  PY.definitions_['import_machine'] = 'import machine';
  return ['machine.freq() or 0' /*emulator gives None*/, PY.ORDER_LOGICAL_OR];
};

PY['lightsleep'] = function(block) {
  PY.definitions_['import_machine'] = 'import machine';
  var time = PY.valueToCode(block, 'TIME', PY.ORDER_NONE);
  return `machine.lightsleep(${time})\n`;
};

PY['brightness'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var val = PY.valueToCode(block, 'VAL', PY.ORDER_NONE);
  return `display.brightness(${val})\n`;
};

PY['screen_dimensions'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var dim = block.getFieldValue('DIM');
  return [`display.${dim}`, PY.ORDER_ATOMIC];
};

PY['exec_python'] = function(block) {
  var command = PY.valueToCode(block, 'command', PY.ORDER_NONE);
  return `exec(${command})\n`;
};

PY['exec_python_output'] = function(block) {
  var command = PY.valueToCode(block, 'command', PY.ORDER_NONE);
  return [`eval(${command})`, PY.ORDER_FUNCTION_CALL];
};

PY['python_try_catch'] = function(block) {
  var code = PY.statementToCode(block, 'try') || PY.PASS;
  var fallback = PY.statementToCode(block, 'catch') || PY.PASS;
  return `try:\n${code}except:\n${fallback}\n`;
};

PY["gc_collect"] = function(block) {
  PY.definitions_['import_gc'] = 'import gc';
  return "gc.collect()\n";
};

PY['var_to_str'] = function(block) {
  var variable = PY.valueToCode(block, 'var', PY.ORDER_NONE);
  return [`str(${variable})`, PY.ORDER_FUNCTION_CALL];
};


PY['var_to_int'] = function(block) {
  var variable = PY.valueToCode(block, 'var', PY.ORDER_NONE);
  return [`int(${variable})`, PY.ORDER_FUNCTION_CALL];
};


PY['var_to_float'] = function(block) {
  var variable = PY.valueToCode(block, 'var', PY.ORDER_NONE);
  return [`float(${variable})`, PY.ORDER_FUNCTION_CALL];
};

PY['timer'] = function(block) {
  var interval = block.getFieldValue('INTERVAL');
  var timerName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var run = PY.statementToCode(block, 'STACK') || PY.PASS;
  var mode = block.getFieldValue('MODE');
  PY.definitions_['import_machine'] = 'import machine';
  PY.definitions_[`import_timer_setup_${timerName}`] = `${timerName} = machine.Timer()`;

  // Allow global variables access inside callback function
  var globals = [];
  var variables = Blockly.Variables.allUsedVarModels(block.workspace) || [];
  for (var i = 0, variable; (variable = variables[i]); i++) {
      globals.push(PY.nameDB_.getName(variable.name,
          Blockly.VARIABLE_CATEGORY_NAME));
  }
  globals = globals.length ? PY.INDENT + 'global ' + globals.join(', ') + '\n' : '';

  PY.definitions_[`import_timer_callback_${timerName}`] = (
    `def ____timerFunc____${timerName}(_):\n${globals}${run}\n\n`);
  return `${timerName}.init(period=${interval}, mode=machine.Timer.${mode}, callback=____timerFunc____${timerName})\n`;
};

PY['stop_timer'] = function(block) {
  var timerName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  PY.definitions_['import_machine'] = 'import machine';
  PY.definitions_[`import_timer_setup_${timerName}`] = `${timerName} = machine.Timer()`;
  return `${timerName}.deinit()\n`;
};

PY['button_pressed'] = function(block) {
  PY.definitions_['import_buttons'] = 'import thumbyButton as buttons';
  var button = block.getFieldValue('BUTTON');
  return [`buttons.${button}()`, PY.ORDER_FUNCTION_CALL];
};
PY['button_justPressed'] = PY['button_pressed'];

PY['audio_play'] = function(block) {
  PY.definitions_['import_audio'] = 'from thumbyAudio import audio';
  var freq = PY.valueToCode(block, 'FREQ', PY.ORDER_NONE);
  var duration = PY.valueToCode(block, 'DURATION', PY.ORDER_NONE);
  return `audio.play(${freq}, ${duration})\n`;
};

PY['audio_playBlocking'] = function(block) {
  PY.definitions_['import_audio'] = 'from thumbyAudio import audio';
  var freq = PY.valueToCode(block, 'FREQ', PY.ORDER_NONE);
  var duration = PY.valueToCode(block, 'DURATION', PY.ORDER_NONE);
  return `audio.playBlocking(${freq}, ${duration})\n`;
};

PY['audio_stop'] = function(block) {
  PY.definitions_['import_audio'] = 'from thumbyAudio import audio';
  return `audio.stop()\n`;
};

const defSaveSsetName = ("saveData.setName(" +
    "globals().get('__file__', 'FAST_EXECUTE').replace('/Games/',''" +
    ").strip('/').split('/')[0].split('.')[0])")

PY['saves_setItem'] = function(block) {
  PY.definitions_['import_saves'] = 'from thumbySaves import saveData';
  PY.definitions_['saves_saveData_setName'] = defSaveSsetName;
  var key = PY.quote_(block.getFieldValue('KEY'));
  var value = PY.valueToCode(block, 'VALUE', PY.ORDER_NONE) || 0;
  return `saveData.setItem(${key}, ${value})\nsaveData.save()\n`;
};

PY['saves_getItem'] = function(block) {
  PY.definitions_['import_saves'] = 'from thumbySaves import saveData';
  PY.definitions_['saves_saveData_setName'] = defSaveSsetName;
  var key = PY.quote_(block.getFieldValue('KEY'));
  return [`saveData.getItem(${key})`, PY.ORDER_FUNCTION_CALL];
};

PY['saves_hasItem'] = function(block) {
  PY.definitions_['import_saves'] = 'from thumbySaves import saveData';
  PY.definitions_['saves_saveData_setName'] = defSaveSsetName;
  var key = PY.quote_(block.getFieldValue('KEY'));
  return [`saveData.hasItem(${key})`, PY.ORDER_FUNCTION_CALL];
};

PY['saves_delItem'] = function(block) {
  PY.definitions_['import_saves'] = 'from thumbySaves import saveData';
  PY.definitions_['saves_saveData_setName'] = defSaveSsetName;
  var key = PY.quote_(block.getFieldValue('KEY'));
  return `saveData.delItem(${key})\n`;
};

PY['print_to_display'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  PY.definitions_['function_print_to_display'] = `def __print_to_display__(message):
      message = str(message)
      display.fill(0)
      txt = [""]
      for line in message.split("\\n"):
          for word in line.split(" "):
              next_len = len(txt[-1]) + len(word) + 1
              if next_len*display.textWidth + (next_len-1) > display.width:
                  txt += [""]
              txt[-1] += (" " if txt[-1] else "") + word
          txt += [""]
      for ln, line in enumerate(txt):
          display.drawText(line, 0, (display.textHeight+1)*ln, 1)
      display.display.show()
  `
  var val = PY.valueToCode(block, 'VAL', PY.ORDER_NONE) || "''";
  return `__print_to_display__(${val})\n`;
};

PY['send_drawn_frame_to_display'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  return `display.update()\n`;
};

PY['drawPixel'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var col = block.getFieldValue('COL');
  var x = PY.valueToCode(block, 'X', PY.ORDER_NONE);
  var y = PY.valueToCode(block, 'Y', PY.ORDER_NONE);
  return `display.setPixel(${x}, ${y}, ${col})\n`;
};

PY['drawFill'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var col = block.getFieldValue('COL');
  return `display.fill(${col})\n`;
};

PY['drawText'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var col = block.getFieldValue('COL');
  var val = PY.valueToCode(block, 'VAL', PY.ORDER_NONE);
  var x = PY.valueToCode(block, 'X', PY.ORDER_NONE);
  var y = PY.valueToCode(block, 'Y', PY.ORDER_NONE);
  return `display.drawText(str(${val}), ${x}, ${y}, ${col})\n`;
};

PY['drawLine'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var col = block.getFieldValue('COL');
  var x = PY.valueToCode(block, 'X', PY.ORDER_NONE);
  var y = PY.valueToCode(block, 'Y', PY.ORDER_NONE);
  var x2 = PY.valueToCode(block, 'X2', PY.ORDER_NONE);
  var y2 = PY.valueToCode(block, 'Y2', PY.ORDER_NONE);
  return `display.drawLine(${x}, ${y}, ${x2}, ${y2}, ${col})\n`;
};

PY['drawRectangle'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var col = block.getFieldValue('COL');
  var shape = block.getFieldValue('SHAPE');
  var x = PY.valueToCode(block, 'X', PY.ORDER_NONE);
  var y = PY.valueToCode(block, 'Y', PY.ORDER_NONE);
  var x2 = PY.valueToCode(block, 'X2', PY.ORDER_NONE);
  var y2 = PY.valueToCode(block, 'Y2', PY.ORDER_NONE);
  return `display.draw${shape}(${x}, ${y}, ${x2}, ${y2}, ${col})\n`;
};

PY['display_drawing'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  return `display.display.show()\n`;
};

PY['setFPS'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var fps = PY.valueToCode(block, 'FPS', PY.ORDER_NONE);
  return `display.setFPS(${fps})\n`;
};

PY['getFPS'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  return [`display.frameRate`, PY.ORDER_FUNCTION_CALL];
};

PY['get_drawn_pixel'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var x = PY.valueToCode(block, 'X', PY.ORDER_NONE) || 0;
  var y = PY.valueToCode(block, 'Y', PY.ORDER_NONE) || 0;
  return [`bool(display.getPixel(${x}, ${y}))`, PY.ORDER_FUNCTION_CALL];
};

PY['setFont'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var font = block.getFieldValue('FONT');
  if (font == "TC-8x8") {
    return `display.setFont("/lib/font8x8.bin", 8, 8, display.textSpaceWidth)\n`
  }
  else if (font == "TC-3x5") {
    return `display.setFont("/lib/font3x5.bin", 3, 5, display.textSpaceWidth)\n`
  }
  return `display.setFont("/lib/font5x7.bin", 5, 7, display.textSpaceWidth)\n`;
};

PY['setFont_with_sprite'] = function(block) {
  // Imports sprites as a font with all the fonts characters:
  //  !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var w = block.getFieldValue('W');
  var h = block.getFieldValue('H');
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  PY.definitions_['import_io'] = 'import io';
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  PY.definitions_['font_sprite_importer'] = `def __setFontFromBytes__(width, height, data):
    if width > len(data) or height > 8:
        return
    display.textBitmapFile = io.BytesIO(data)
    display.textWidth = width
    display.textHeight = height
    display.textBitmap = bytearray(width)
    display.textCharCount = len(data) // width
`;
  return `__setFontFromBytes__(${w}, ${h}, ${spriteName}.bitmap)\n`;
};

PY['setFont_gap'] = function(block) {
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  var gap = block.getFieldValue('GAP');
  return `display.textSpaceWidth = ${gap}\n`
};

PY['load_sprite'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName} = Sprite(${block.data
    .replace("# BITMAP: width: ", "")
    .replace(" height: ", "")
    .replace(/\n\w+ = /, ",")}, ${spriteName}.x,${spriteName}.y,` +
    `${spriteName}.key,${spriteName}.mirrorX,${spriteName}.mirrorY)\n`;
};

PY['load_anim_sprite'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var frames = block.getFieldValue('FRMS');
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName} = Sprite(${block.data
    .replace("# BITMAP: width: ", "")
    .replace(", height: ", `//${frames},`)
    .replace(/\n\w+ = /, ",")}, ${spriteName}.x,${spriteName}.y,` +
    `${spriteName}.key,${spriteName}.mirrorX,${spriteName}.mirrorY)\n`;
};

PY['drawSprite'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `display.drawSprite(${spriteName})\n`;
};

PY['drawSpriteWithMask'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var maskSprite = PY.nameDB_.getName(block.getFieldValue('MSK'), NM.NameType.VARIABLE);
  PY.definitions_['import_graphics'] = 'from thumbyGraphics import display';
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  PY.definitions_[`import_sprite_setup_${maskSprite}`] = `${maskSprite} = Sprite(1,1,bytearray([1]))`;
  return `\
if ${spriteName}.width == ${maskSprite}.width and ${spriteName}.height == ${maskSprite}.height:
    display.drawSpriteWithMask(${spriteName}, ${maskSprite})
`;
};

PY['set_transparency'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var val = block.getFieldValue('VAL');
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName}.key = ${val}\n`;
};

PY['flip'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName}.mirrorY = 0 if ${spriteName}.mirrorY else 1\n`;
};

PY['mirror'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName}.mirrorX = 0 if ${spriteName}.mirrorX else 1\n`;
};

PY['move_x_to'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var v = PY.valueToCode(block, 'V', PY.ORDER_NONE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName}.x = ${v}\n`;
};
PY['move_y_to'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var v = PY.valueToCode(block, 'V', PY.ORDER_NONE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName}.y = ${v}\n`;
};
PY['move_x_by'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var v = PY.valueToCode(block, 'V', PY.ORDER_NONE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName}.x += ${v}\n`;
};
PY['move_y_by'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var v = PY.valueToCode(block, 'V', PY.ORDER_NONE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName}.y += ${v}\n`;
};

PY['get_sprite_size'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var attr = PY.nameDB_.getName(block.getFieldValue('ATTR'), NM.NameType.VARIABLE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return [`${spriteName}.${attr}`, PY.ORDER_MEMBER];
};

PY['get_sprite_orien'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var attr = PY.nameDB_.getName(block.getFieldValue('ATTR'), NM.NameType.VARIABLE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return [`bool(${spriteName}.${attr})`, PY.ORDER_MEMBER];
};

PY['get_sprite_frame'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return [`${spriteName}.getFrame()`, PY.ORDER_FUNCTION_CALL];
};

PY['setFrame'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var frame = PY.valueToCode(block, 'FRM', PY.ORDER_NONE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName}.setFrame(${frame})\n`;
};

PY['sprite_to_var'] = function(block) {
  var s = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  return [`Sprite(${s}.width,${s}.height,${s}.bitmapSource,${s}.x,${s}.y,${s}.key,${s}.mirrorX,${s}.mirrorY)`, PY.ORDER_FUNCTION_CALL];
};

PY['var_to_sprite'] = function(block) {
  var spriteName = PY.nameDB_.getName(block.getFieldValue('VAR'), NM.NameType.VARIABLE);
  var frm = PY.nameDB_.getName(block.getFieldValue('SRC'), NM.NameType.VARIABLE);
  PY.definitions_['import_sprite'] = 'from thumbySprite import Sprite';
  PY.definitions_[`import_sprite_setup_${spriteName}`] = `${spriteName} = Sprite(1,1,bytearray([1]))`;
  return `${spriteName} = ${frm} if isinstance(${frm}, Sprite) else Sprite(1,1,bytearray([1]))\n`
};
