import { useNotebookEditorCtx } from "@/editor/editor.ctx";
import { slashSuggestions } from "@/editor/plugins/slash.plugin";
import { SlashCmd } from "@harshtalks/slash-tiptap";
import { EditorContent } from "@tiptap/react";
import { BubbleMenuWrapper } from "./bubble-menu";

const Playground = () => {
  const editor = useNotebookEditorCtx();
  return (
    <div>
      <BubbleMenuWrapper />
      <SlashCmd.Root editor={editor}>
        <SlashCmd.Cmd className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background p-2 shadow-[rgba(100,_100,_111,_0.2)_0px_7px_29px_0px] transition-all">
          <SlashCmd.List>
            {slashSuggestions.map((item) => (
              <SlashCmd.Item
                value={item.title}
                onCommand={(val) => {
                  item.command(val);
                }}
                className="flex w-full items-center space-x-2 cursor-pointer rounded-md p-2 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-xs">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </SlashCmd.Item>
            ))}
            <SlashCmd.Empty className="text-xs px-4">
              No results found
            </SlashCmd.Empty>
          </SlashCmd.List>
        </SlashCmd.Cmd>
      </SlashCmd.Root>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Playground;
