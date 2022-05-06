import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux';
import { createTheme } from '@material-ui/core';
import { toHTML, toMarkdown, toTex, ReferenceKind, process, toText } from '@curvenote/schema';
import { Fragment } from 'prosemirror-model';
import { actions, Editor, EditorMenu, Store, setup, Suggestions, Attributes, InlineActions, LinkResult } from '@curvenote/editor/dist/src';
import rootReducer from './reducers';
import middleware from './middleware';
import 'katex/dist/katex.min.css';
import 'codemirror/lib/codemirror.css';
import './styles/index.scss'
import 'sidenotes/dist/sidenotes.css';
import { Options } from '@curvenote/editor/dist/src/connect';
import SuggestionSwitch from '@curvenote/editor/dist/src/components/Suggestion/Switch';
import InlineActionSwitch from '@curvenote/editor/dist/src/components/InlineActions/Switch';

declare global {
  interface Window {
    [index: string]: any;
  }
}

const store: Store = configureStore({ reducer: rootReducer, middleware });
const theme = createTheme({});

const stateKey = 'myEditor';
const viewId1 = 'view1';
const docId = 'docId';

const someLinks: LinkResult[] = [
  {
    kind: ReferenceKind.cite,
    uid: 'simpeg2015',
    label: 'simpeg',
    content: 'Cockett et al., 2015',
    title:
      'SimPEG: An open source framework for simulation and gradient based parameter estimation in geophysical applications.',
  },
  {
    kind: ReferenceKind.link,
    uid: 'https://curvenote.com',
    label: null,
    content: 'Curvenote',
    title: 'Move ideas forward',
  },
];

const opts: Options = {
  transformKeyToId: (key) => key,
  uploadImage: async (file) => {
    return URL.createObjectURL(file);
  },
  onDoubleClick(stateId, viewId) {
    // eslint-disable-next-line no-console
    console.log('Double click', stateId, viewId);
    return false;
  },
  getDocId() {
    return docId;
  },
  theme,
  citationPrompt: async () => [
    {
      key: 'simpeg2015',
      kind: ReferenceKind.cite,
      text: 'Cockett et al, 2015',
      label: 'simpeg',
      title: '',
    },
  ],
  createLinkSearch: async () => ({ search: () => someLinks }),
  getCaptionFragment: (schema) => Fragment.fromArray([schema.text('Hello caption world!')]),
  nodeViews: {},
};

setup(store, opts);

window.store = store;
store.dispatch(actions.initEditorState('full', stateKey, true, '<h1>Untitled Document</h1>', 0));

store.subscribe(() => {
  const myst = document.getElementById('myst');
  const text = document.getElementById('text');
  const tex = document.getElementById('tex');
  const html = document.getElementById('html');
  const editor = store.getState().editor.state.editors[stateKey];
  if (myst) {
    try {
      myst.innerText = toMarkdown(editor.state.doc);
    } catch (e) {
      myst.innerText = 'Error converting to markdown';
    }
  }
  if (tex) {
    try {
      tex.innerText = toTex(editor.state.doc);
    } catch (error) {
      tex.innerText = 'There was an error :(';
    }
  }
  if (text) {
    try {
      text.innerText = toText(editor.state.doc);
    } catch (error) {
      text.innerText = 'There was an error :(';
    }
  }
  if (html) {
    html.innerText = toHTML(editor.state.doc, editor.state.schema, document);
  }
  // Update the counter
  const counts = process.countState(editor.state);
  const words = process.countWords(editor.state);
  const updates = {
    'count-sec': `${counts.sec.all.length} (${counts.sec.total})`,
    'count-fig': `${counts.fig.all.length} (${counts.fig.total})`,
    'count-eq': `${counts.eq.all.length} (${counts.eq.total})`,
    'count-code': `${counts.code.all.length} (${counts.code.total})`,
    'count-table': `${counts.table.all.length} (${counts.table.total})`,
    'count-words': `${words.words}`,
    'count-char': `${words.characters_including_spaces}  (${words.characters_excluding_spaces})`,
  };
  Object.entries(updates).forEach(([key, count]) => {
    const el = document.getElementById(key);
    if (el) el.innerText = count;
  });
});

function App() {
  return (
    <Provider store={store}>
      <EditorMenu standAlone />
      <InlineActions>
        <InlineActionSwitch />
      </InlineActions>
      <article id={docId} className="content centered">
        <div className="selected">
          <Editor stateKey={stateKey} viewId={viewId1} />
        </div>
      </article>
      <Suggestions>
        <SuggestionSwitch />
      </Suggestions>
      <Attributes />
    </Provider>
  );
}

export default App;
