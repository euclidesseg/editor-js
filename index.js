import { EditorState } from "https://esm.sh/prosemirror-state";
import { EditorView } from "https://esm.sh/prosemirror-view";
import { Schema, DOMParser } from "https://esm.sh/prosemirror-model";
import { schema } from "https://esm.sh/prosemirror-schema-basic";
import { history } from "https://esm.sh/prosemirror-history";
import { keymap } from "https://esm.sh/prosemirror-keymap";
import { baseKeymap } from "https://esm.sh/prosemirror-commands";
import { toggleMark, setBlockType } from "https://esm.sh/prosemirror-commands";
import { addListNodes } from "https://esm.sh/prosemirror-schema-list";



// EditorState → Guarda TODO el estado del editor (documento, selección, plugins)
// EditorView → Es el editor visual que se renderiza en el DOM
// Schema → Define qué tipos de nodos y marcas existen (párrafo, heading, bold, etc.)
// DOMParser → Convierte HTML → documento interno de ProseMirror
// schema-basic → Esquema base (párrafos, headings, bold, italic…)
// addListNodes → Agrega listas (ul, ol, li) al schema
// exampleSetup → Instala plugins de DEMO (menú, teclas, history, atajos, etc.)


/*
EL SCHEMA ES EL "DICCIONARIO" DEL EDITOR 📚

Aquí se define el lenguaje que el editor entiende.

Dentro del schema existen dos cosas principales:

1️⃣ NODES (nodos) → Son los BLOQUES o estructuras del documento
2️⃣ MARKS (marcas) → Son formatos que se aplican al TEXTO dentro de un bloque


━━━━━━━━━━━━━━━━━━
🧱 NODES = MODIFICAN BLOQUES COMPLETOS
━━━━━━━━━━━━━━━━━━

Un nodo es como una "caja" que contiene texto u otros nodos.

Ejemplos de bloques:
<p>      párrafo
<h1>     título
<ul>     lista
<li>     elemento de lista
<blockquote> cita
<pre>    code block

Si quieres modificar TODO el bloque, se hace como atributo del nodo.

Ejemplo:
Alineación, fondo, margen, sangría, etc.

<p style="text-align:center">Hola mundo</p>

Eso vive en:
nodes → paragraph.attrs


━━━━━━━━━━━━━━━━━━
✏️ MARKS = MODIFICAN TEXTO DENTRO DEL BLOQUE
━━━━━━━━━━━━━━━━━━

Las marks NO cambian la estructura,
solo envuelven partes del texto.

Ejemplo:

<p>Hola <s>mundo</s></p>

Aquí el bloque es el párrafo,
pero "mundo" tiene una MARK.

Ejemplos de marks:
<strong>   bold
<em>       italic
<a>        link
<code>     code inline
<s>        strike (NO viene por defecto)

Eso vive en:
marks → schema.spec.marks


━━━━━━━━━━━━━━━━━━
📦 LO QUE TRAE prosemirror-schema-basic
━━━━━━━━━━━━━━━━━━

NODES incluidos:
✔ doc
✔ paragraph <p>
✔ heading <h1-h6>
✔ blockquote
✔ horizontal_rule <hr>
✔ code_block <pre>
✔ image
✔ hard_break <br>
✔ text

MARKS incluidos:
✔ strong (bold)
✔ em (italic)
✔ link
✔ code (inline code)

━━━━━━━━━━━━━━━━━━
🚫 COSAS QUE NO VIENEN Y DEBES AGREGAR TÚ
━━━━━━━━━━━━━━━━━━

🎨 MARKS (modifican TEXTO dentro de un bloque)

❌ strike / tachado → <s>texto</s>
❌ underline / subrayado → <u>texto</u>
❌ color de texto → letras rojas, azules, etc.
❌ background / highlight → fondo de palabras
❌ fontSize → tamaño de letra
❌ fontFamily → tipo de fuente


🧱 NODES (modifican BLOQUES o crean estructura)

❌ textAlign → alineación del párrafo (izq, centro, der)
❌ tablas → table, row, cell, header
❌ video embed → <iframe>, <video>
❌ menciones (@usuario) → nodo inline especial
❌ custom blocks → warning, info, success, quote box
❌ cards / embeds → previews de links tipo Notion
❌ columnas / layouts → bloques en columnas
❌ checklist → lista con checkboxes

━━━━━━━━━━━━━━━━━━
Regla de oro:
Si modifica letras → MARK
Si modifica estructura → NODE
━━━━━━━━━━━━━━━━━━


/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 CÓMO AGREGAR COSAS NUEVAS AL EDITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

El schema es el "diccionario" del editor.
Dentro de él definimos:

• nodes  → estructuras y bloques
• marks  → estilos que afectan texto dentro de un bloque


━━━━━━━━━━━━━━━━━━
🎨 AGREGAR UN MARK (estilo de texto)
━━━━━━━━━━━━━━━━━━
Los MARKS modifican palabras o partes del texto.

Ejemplos:
bold, italic, strike, color, background, underline

1️⃣ Definir el mark
const strike = {
  parseDOM: [
    { tag: "s" },
    { tag: "del" },
    { style: "text-decoration=line-through" }
  ],
  toDOM() { return ["s", 0]; }
};

2️⃣ Agregarlo al schema
marks: schema.spec.marks.addToEnd("strike", strike)

3️⃣ Usarlo
toggleMark(mySchema.marks.strike)(view.state, view.dispatch);


━━━━━━━━━━━━━━━━━━
🧱 AGREGAR UN NODE (bloque o estructura)
━━━━━━━━━━━━━━━━━━
Los NODES crean bloques completos o nuevas estructuras.

Ejemplos:
párrafos, headings, tablas, videos, bloques info, menciones

1️⃣ Definir el node
const warningBlock = {
  group: "block",
  content: "inline*",
  parseDOM: [{ tag: "div.warning" }],
  toDOM() { return ["div", { class: "warning" }, 0]; }
};

2️⃣ Agregarlo
let nodes = schema.spec.nodes.addToEnd("warning_block", warningBlock);

3️⃣ Crear el schema
new Schema({ nodes, marks })

4️⃣ Usarlo
setBlockType(mySchema.nodes.warning_block)(view.state, view.dispatch);

*/



// 📦 Creamos un objeto llamado "paragraph"
// Este objeto será la NUEVA versión del nodo párrafo del editor

// 🔁 ...schema.spec.nodes.get("paragraph")
// Línea: ...schema.spec.nodes.get("paragraph"),
// Copiamos TODO lo que ya sabía hacer el párrafo original
// Es como clonar un párrafo normal y luego mejorarlo

// 🧠 attrs:
// Línea: attrs: {
// Aquí definimos las "propiedades que puede recordar el párrafo"
// Como si al párrafo le diéramos memoria

// 🎯 textAlign: { default: "left" }
// Línea: textAlign: { default: "left" }
// Creamos un atributo nuevo llamado textAlign
// Sirve para guardar la alineación del texto (left, center, right)
// "default" significa: si nadie dice nada → usar "left"

// 📥 parseDOM:
// Línea: parseDOM: [{
// Esto se usa cuando el editor LEE HTML del navegador
// (por ejemplo cuando cargas contenido ya existente)

// 🏷 tag: "p"
// Línea: tag: "p",
// Le decimos: "esto aplica a todas las etiquetas <p>"

// 🔍 getAttrs: dom => ({ ... })
// Línea: getAttrs: dom => ({
// Esta función mira el <p> real del HTML
// y decide qué valores guardar dentro del editor

// 🎯 textAlign: dom.style.textAlign || "left"
// Línea: textAlign: dom.style.textAlign || "left"
// Leemos el estilo CSS del párrafo (<p style="text-align:center">)
// Si no tiene alineación, usamos "left"

// 📤 toDOM(node)
// Línea: toDOM(node) {
// Esto se usa cuando el editor CREA el HTML para mostrarlo en pantalla

// 🏗 return [...]
// Línea: return [
// Aquí decimos cómo construir el <p> real en el navegador

// 🏷 "p"
// Línea: "p",
// Crear una etiqueta <p>

// 🎨 { style: `text-align:${node.attrs.textAlign}` }
// Línea: { style: `text-align:${node.attrs.textAlign}` },
// Aplicamos el estilo CSS usando el valor guardado en el editor
// node.attrs.textAlign es la "memoria" del párrafo

// 🔢 0
// Línea: 0
// Significa: "aquí dentro va el contenido del párrafo (el texto)"


// creamos nustro node ol (list item)
const olDOM = ["ol", ["ol", 0]]


const ol={
  content:"inline*",
  group:'block',
  parseDom:[{tag:'ol'}],
  toDOM(){ return olDOM}
}

const paragraph = {
  ...schema.spec.nodes.get("paragraph"),

  attrs: {
    textAlign: { default: "left" }
  },

  parseDOM: [{
    tag: "p",
    getAttrs: dom => ({
      textAlign: dom.style.textAlign || "left"
    })
  }],

  toDOM(node) {
    return [
      "p",
      { style: `text-align:${node.attrs.textAlign}` },
      0
    ]
  }
};

// Actualizamos el esquema original reemplazando el párrafo viejo por el nuevo creado en el bloqe anterior anteriormente
let nodes = schema.spec.nodes.update("paragraph", paragraph);


// creamos el mark strike (tachado)
const strike = {
  parseDOM: [
    { tag: "s" },
    { tag: "del" },
    { style: "text-decoration=line-through" }
  ],
  toDOM() {
    return ["s", 0];
  }
};


nodes = nodes.addToEnd("ol", ol)
console.log(schema)


//Un botón solo puede aplicar formatos que estén definidos en: marks: schema.spec.marks de promisemirror-schema-basic
const mySchema = new Schema({
  nodes: addListNodes(nodes, "paragraph block*", "block"),
  marks: schema.spec.marks.addToEnd("strike", strike)
});

// Aquí conectamos combinaciones de teclas con comandos del editor
// "Mod" significa Ctrl (Windows) o Cmd (Mac)
const myKeymap = keymap({
  "Mod-b": toggleMark(mySchema.marks.strong),
  "Mod-i": toggleMark(mySchema.marks.em),
});


// Los plugins son los "poderes" del editor:
// history → undo/redo
// keymaps → atajos
const plugins = [
  history(),
  myKeymap,
  keymap(baseKeymap)
];

// creacion del estado del editor
const state = EditorState.create({
  doc: DOMParser.fromSchema(mySchema).parse(document.querySelector("#content")),
  plugins
});

// crear el editor
const view = new EditorView(document.querySelector("#editor"), {
  state,
  attributes: { class: "euclides-editor" }
});







//=====================================================================//
//=============== BOTONES DE INTERACCION CON ELL EDITOR ===============//
//=====================================================================//


// toggleMark(mySchema.marks.em)(view.state, view.dispatch);
// toggleMark crea un COMANDO para activar/desactivar un formato (italic aquí)
// (view.state, view.dispatch) ejecuta ese comando sobre el editor actual
// Es como decir: "aplica cursiva a la selección actual"
// toggleMark(...)  → "prepara la acción"
// (...)(state, dispatch) → "ejecútala"

document.getElementById("boldBtn").onclick = () => {
  toggleMark(mySchema.marks.strong)(view.state, view.dispatch);
  view.focus();
};

document.getElementById("boldBtn").onclick = () => {
  toggleMark(mySchema.marks.strong)(view.state, view.dispatch);
  view.focus();
};
document.getElementById("italicBtn").onclick = () => {
  toggleMark(mySchema.marks.em)(view.state, view.dispatch);
  view.focus();
};
document.getElementById("bulletListBtn").onclick = () => {
  setBlockType(mySchema.nodes.ol)(view.state, view.dispatch);
  view.focus();
};

alignLeftBtn.onclick = () => setTextAlign("left")(view.state, view.dispatch);
alignCenterBtn.onclick = () => setTextAlign("center")(view.state, view.dispatch);
alignRightBtn.onclick = () => setTextAlign("right")(view.state, view.dispatch);
alignJustifyBtn.onclick = () => setTextAlign("justify")(view.state, view.dispatch);


function setTextAlign(align) {
  return setBlockType(mySchema.nodes.paragraph, { textAlign: align });
}
document.getElementById("codeBlockBtn").onclick = () => {
  setBlockType(mySchema.nodes.code_block)(view.state, view.dispatch);
  view.focus();
}

document.getElementById("strikeBtn").onclick = () => {
  toggleMark(mySchema.marks.strike)(view.state, view.dispatch);
  view.focus();
}