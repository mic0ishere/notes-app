import electron from "electron";
import React, { useEffect } from "react";
import Head from "next/head";
import { Converter } from "showdown";

const ipcRenderer = electron.ipcRenderer || false;

function Home() {
  const converter = new Converter();
  const [notes, setNotes] = React.useState([]);
  const [note, setNote] = React.useState({
    createdAt: null,
    note: "",
  });
  const [useMarkdown, setUseMarkdown] = React.useState(true);
  const save = (data = notes) => {
    ipcRenderer.send("set-notes", data);
  };
  const deleteNote = (deleteNote) => {
    save(notes.filter((note) => note.createdAt !== deleteNote.createdAt));
    setNotes(notes.filter((note) => note.createdAt !== deleteNote.createdAt));
    if (deleteNote.createdAt === note.createdAt) {
      setNote({
        createdAt: null,
        note: "",
      });
    }
  };
  const onChange = async (e) => {
    setNote({
      createdAt: note.createdAt,
      note: e.target.value,
    });
  };

  useEffect(() => {
    setNotes(notes.map((n) => (n.createdAt === note.createdAt ? note : n)));
  }, [note]);
  useEffect(() => {
    setNotes(ipcRenderer.sendSync("get-notes"));
    return () => {};
  }, []);
  return (
    <>
      <Head>
        <title>Notes</title>
      </Head>
      <div className="w-screen min-h-screen flex flex-row justify-center">
        <nav className="flex flex-col w-64 text-gray-700 bg-gray-100 mr-2 h-screen p-4 relative">
          <button
            className="block px-4 py-2 mb-2 text-base font-semibold text-white bg-green-500 rounded-lg hover:text-white hover:bg-green-600 focus:outline-none focus:shadow-outline"
            onClick={() => {
              const newNote = {
                createdAt: Date.now(),
                note: "",
              };
              setNotes([...notes, newNote]);
              setNote(newNote);
            }}
          >
            New Note
          </button>
          {notes.map((x) => {
            if (!x) return null;
            const name =
              x.note
                .split("\n")[0]
                .substr(0, 10)
                .trim()
                .replace(/(\r\n|\n|\r)/gm, "") || "Untitled";
            return (
              <div
                className={`flex flex-row justify-between px-4 py-2 mt-2 text-base text-gray-900 rounded-lg hover:text-gray-900 hover:bg-gray-300 ${
                  x.createdAt === note.createdAt
                    ? "bg-gray-300"
                    : "bg-gray-200 hover:bg-opacity-70"
                }`}
                key={x.createdAt}
              >
                <button
                  onClick={() => setNote(x)}
                  className="focus:outline-none focus:shadow-outline w-full font-semibold"
                >
                  {x.note.split("\n")[0].length > 10 ? `${name}...` : name}
                </button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cursor-pointer"
                  onClick={() => deleteNote(x)}
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
            );
          })}
          <div className="flex items-center justify-center w-full absolute bottom-6 -ml-5">
            <label htmlFor="markdown" className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  id="markdown"
                  type="checkbox"
                  className="sr-only"
                  defaultChecked={true}
                  onChange={(e) => setUseMarkdown(e.target.checked)}
                />
                <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                <div className="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"></div>
              </div>
              <div className="ml-3 font-medium">Use Markdown</div>
            </label>
          </div>
        </nav>
        <div className={`flex flex-row text-black flex-grow p-4 w-full`}>
          {note.createdAt && (
            <>
              <div className="flex flex-col w-full">
                <textarea
                  className="h-full w-full bg-gray-100 outline-none p-2 rounded resize-none"
                  onChange={onChange}
                  value={note.note}
                />
                <span className="ml-2 mt-6">
                  Created on{" "}
                  {new Date(note.createdAt).toLocaleString("en-US", {
                    weekday: "short",
                    day: "numeric",
                    year: "numeric",
                    month: "long",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                  })}
                </span>
              </div>
              <div
                className={`flex-col mx-4 w-2/3 ${
                  useMarkdown ? "flex" : "hidden"
                }`}
              >
                <div
                  className="w-full h-full bg-gray-100 p-4 rounded mb-12 prose"
                  dangerouslySetInnerHTML={{
                    __html: converter.makeHtml(note.note),
                  }}
                ></div>
              </div>
              <button
                onClick={() => {
                  save();
                }}
                className="block px-4 py-2 mb-2 text-base font-semibold text-white bg-green-500 rounded-lg hover:text-white hover:bg-green-600 focus:outline-none focus:shadow-outline w-32 absolute left-1/2 bottom-0"
                style={{
                  transform: "translateX(-50%)",
                }}
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
