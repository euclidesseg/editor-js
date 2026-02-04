import { EditorState,Plugin } from "https://esm.sh/prosemirror-state";
import { EditorView } from "https://esm.sh/prosemirror-view";
import { Schema, DOMParser } from "https://esm.sh/prosemirror-model";
import { schema } from "https://esm.sh/prosemirror-schema-basic";

import { history, undo, redo, undoDepth, redoDepth } from "https://esm.sh/prosemirror-history";
import { keymap } from "https://esm.sh/prosemirror-keymap";
import { baseKeymap } from "https://esm.sh/prosemirror-commands";
import { toggleMark, setBlockType, chainCommands } from "https://esm.sh/prosemirror-commands";
import { addListNodes } from "https://esm.sh/prosemirror-schema-list";
import { wrapInList, liftListItem } from "https://esm.sh/prosemirror-schema-list";
import { splitListItem } from "https://esm.sh/prosemirror-schema-list";

import { switchList } from "./src/commands/listCommands.js";





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


// creamos nustros nodes ol, ul, li (list item)


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

//Un botón solo puede aplicar formatos que estén definidos en: marks: schema.spec.marks de promisemirror-schema-basic
const mySchema = new Schema({
  nodes: addListNodes(nodes, "paragraph block*", "block"),
  marks: schema.spec.marks.addToEnd("strike", strike)
});

console.log(mySchema)
// Aquí conectamos combinaciones de teclas con comandos del editor
// "Mod" significa Ctrl (Windows) o Cmd (Mac)
const myKeymap = keymap({
  "Mod-b": toggleMark(mySchema.marks.strong),
  "Mod-i": toggleMark(mySchema.marks.em),
  "Mod-i": toggleMark(mySchema.marks.em),
  "Mod-z": undo,
  "Mod-y": redo,
  "Shift-Mod-z": redo, // 🔥 Mac usa este
  // agrega una nuevo item de lista
  "Enter": splitListItem(mySchema.nodes.list_item),
});


const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

// actualizar botones de undo/redo
const updatePlugin = new Plugin({
  view() {
    return {
      update() {
        undoBtn.disabled = undoDepth(view.state) === 0;
        redoBtn.disabled = redoDepth(view.state) === 0;
      }
    }
  }
});

// Los plugins son los "poderes" del editor:
// history → undo/redo
// keymaps → atajos
const plugins = [
  history(),
  myKeymap,
  keymap(baseKeymap),
  updatePlugin
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

undoBtn.disabled = undoDepth(view.state) === 0;
redoBtn.disabled = redoDepth(view.state) === 0;   





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

document.getElementById("italicBtn").onclick = () => {
  toggleMark(mySchema.marks.em)(view.state, view.dispatch);
  view.focus();
};

// Listas
document.getElementById("bulletListBtn").onclick = () => {
  switchList(mySchema.nodes.bullet_list)(view.state, view.dispatch);
  view.focus();
};
document.getElementById("orderListBtn").onclick = () => {
  switchList(mySchema.nodes.ordered_list)(view.state, view.dispatch);
  view.focus();
};



// Listas


// Alineacion de parrafos
document.getElementById("alignLeftBtn").onclick = () =>
  setTextAlign("left")(view.state, view.dispatch);

document.getElementById("alignCenterBtn").onclick = () =>
  setTextAlign("center")(view.state, view.dispatch);

document.getElementById("alignRightBtn").onclick = () =>
  setTextAlign("right")(view.state, view.dispatch);

document.getElementById("alignJustifyBtn").onclick = () =>
  setTextAlign("justify")(view.state, view.dispatch);

function setTextAlign(align) {
  return setBlockType(mySchema.nodes.paragraph, { textAlign: align });
}
// Alineacion de parrafos

document.getElementById("codeBlockBtn").onclick = () => {
  setBlockType(mySchema.nodes.code_block)(view.state, view.dispatch);
  view.focus();
}

document.getElementById("strikeBtn").onclick = () => {
  toggleMark(mySchema.marks.strike)(view.state, view.dispatch);
  view.focus();
}


document.getElementById("linkBtn").onclick = () => {
  const url = prompt("Introduce la URL");

  if (!url) return;

  toggleMark(
    mySchema.marks.link,
    { href: url, title: url } // 👈 atributos
  )(view.state, view.dispatch);

  view.focus();
};



const headingContainer = document.getElementById('heading-container');
const headingBtn = document.getElementById('btn-heading');

document.addEventListener('click', (event) => {
  const clickedBtn = event.target.closest('#btn-heading');
  const options = document.getElementById('heading-options');

  // Cerrar si se hace click fuera
  if (!clickedBtn && options) {
    options.remove();
    return;
  }

  // Si clic en botón principal
  if (clickedBtn) {
    if (options) {
      options.remove();
      return;
    }
    createHeadingMenu();
  }
});

function createHeadingMenu() {
  const div = document.createElement('div');
  div.id = 'heading-options';
  div.innerHTML = getHeadingOptionsHTML();

  headingContainer.appendChild(div);

  // 🔥 UN SOLO LISTENER (delegación)
  div.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const level = Number(button.dataset.level);

    // Obtener SVG del botón correcto
    const svg = button.querySelector('svg');
    headingBtn.querySelector('span').innerHTML = svg.outerHTML;

    // ProseMirror
    setBlockType(mySchema.nodes.heading, { level })(view.state, view.dispatch);
    view.focus();

    div.remove();
  });
}

function getHeadingOptionsHTML() {
  return `
  <button class="heading-option" data-level="1">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M6 16.5q-.214 0-.357-.144T5.5 16V8q0-.213.144-.356t.357-.144t.356.144T6.5 8v3.5h5V8q0-.213.144-.356t.357-.144t.356.144T12.5 8v8q0 .213-.144.356t-.357.144t-.356-.144T11.5 16v-3.5h-5V16q0 .213-.144.356t-.357.144m11 0q-.212 0-.356-.144T16.5 16V8.5H15q-.213 0-.356-.144t-.144-.357t.144-.356T15 7.5h1.683q.357 0 .587.232t.23.576V16q0 .213-.144.356t-.357.144"/>
      </svg>
    </button>
    <button class="heading-option" data-level="2">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 16.5q-.214 0-.357-.144T3.5 16V8q0-.213.144-.356t.357-.144t.356.144T4.5 8v3.5h5V8q0-.213.144-.356t.357-.144t.356.144T10.5 8v8q0 .213-.144.356t-.357.144t-.356-.144T9.5 16v-3.5h-5V16q0 .213-.144.356t-.357.144m9.309 0q-.343 0-.576-.232t-.232-.576v-2.576q0-.667.475-1.141t1.14-.475h3.77q.269 0 .442-.173t.173-.442v-1.77q0-.269-.173-.442t-.442-.173H13q-.213 0-.356-.144t-.144-.357t.144-.356T13 7.5h4.885q.666 0 1.14.475t.475 1.14v1.77q0 .666-.475 1.14t-1.14.475h-3.77q-.269 0-.442.173t-.173.443V15.5H19q.213 0 .356.144t.144.357t-.144.356T19 16.5z"/>
      </svg>
    </button>
    <button class="heading-option" data-level="3">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4 16.5q-.214 0-.357-.144T3.5 16V8q0-.213.144-.356t.357-.144t.356.144T4.5 8v3.5h5V8q0-.213.144-.356t.357-.144t.356.144T10.5 8v8q0 .213-.144.356t-.357.144t-.356-.144T9.5 16v-3.5h-5V16q0 .213-.144.356t-.357.144m9.001 0q-.213 0-.356-.144t-.144-.357t.144-.356T13 15.5h4.885q.269 0 .442-.173t.173-.442V12.5H15q-.213 0-.356-.144t-.144-.357t.144-.356T15 11.5h3.5V9.116q0-.27-.173-.443t-.442-.173H13q-.213 0-.356-.144t-.144-.357t.144-.356T13 7.5h4.885q.666 0 1.14.475t.475 1.14v5.77q0 .666-.475 1.14t-1.14.475z"/>
      </svg>
    </button>
    <button class="heading-option" data-level="4">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path fill="currentColor" d="M4 16.5q-.214 0-.357-.144T3.5 16V8q0-.213.144-.356t.357-.144t.356.144T4.5 8v3.5h5V8q0-.213.144-.356t.357-.144t.356.144T10.5 8v8q0 .213-.144.356t-.357.144t-.356-.144T9.5 16v-3.5h-5V16q0 .213-.144.356t-.357.144m14 0q-.212 0-.356-.144T17.5 16v-2.5h-4.192q-.344 0-.576-.232t-.232-.576V8q0-.213.144-.356t.357-.144t.356.144T13.5 8v4.5h4V8q0-.213.144-.356t.357-.144t.356.144T18.5 8v4.5H20q.213 0 .356.144t.144.357t-.144.356T20 13.5h-1.5V16q0 .213-.144.356t-.357.144"/>
        </svg>
    </button>
  `;
}



undoBtn.addEventListener('click', () => {
  if (undo(view.state, view.dispatch)) {
    view.focus();
  }
});

redoBtn.addEventListener('click', () => {
  if (redo(view.state, view.dispatch)) {
    view.focus();
  }
});




console.log(view.state);