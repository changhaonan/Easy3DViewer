class MarkdownToc {

    constructor(level2show, list_of_md_str, root_dir) {
        // Sync reading
        jQuery.ajaxSetup({ async: false });
        this.levelsToShow = level2show;
        this.menus = [];

        let list_of_md = list_of_md_str.split(",");
        for (let i = 0; i < list_of_md.length; ++i) {
            let md_file_name = "/markdown/" + root_dir + "/" + list_of_md[i] + ".md";
            $.get(md_file_name, (data) => {
                this.process(data);
            })
        }
        jQuery.ajaxSetup({ async: true });
    }

    getToc() { return this.menus.join("\n"); }

    process(md_value) {
        const input = md_value;
        
        let isCodeBlock = false;
        let topLevel = 1;  // TopLevel is fixed to 1
        let previous = null;

        for (let line of input.split("\n")) {

            const trimmed = line.trim();
    
            if (trimmed.startsWith("```")) {
                isCodeBlock = !isCodeBlock;
            }

            if (isCodeBlock) {
                continue;
            }

            let level = NaN;
            let title = null;

            // Check for:
            // 1. ATX-style headers: ## My Header
            //
            // 2. Setext-style headers:
            //     a) Level 1 header: My Header
            //                        =========
            //
            //     b) Level 2 header: My Header
            //                        ---------
            //
            //    Edge cases that do not count as headers:
            //     i) Horizontal rule ("Underline" preceded by empty line):
            //
            //           Some paragraph 1
            //           <empty line>
            //           -----
            //           Some paragraph 2
            //
            //     ii) Two or more horizontal rules:
            //
            //           Some paragraph 1
            //
            //           -----
            //           -----
            //           -----
            //           Some paragraph 2

            if (trimmed.startsWith("#")) {
                const match = trimmed.match(/(#+)\s*(.*?)#*\s*$/);
                level = match[1].length;
                title = match[2].trim();
            } else if (previous != null && previous.length > 0 && trimmed.length > 0) {
                if (trimmed.match(/[^=]/g) == null) {
                    level = 1;
                    title = previous;
                } else if (trimmed.match(/[^-]/g) == null && previous.match(/[^-]/g) != null) {
                    level = 2;
                    title = previous;
                }
            }

            if (!isNaN(level) && title != null) {
                //if (isNaN(topLevel)) {
                //    topLevel = level;
                //}

                if (level - topLevel >= this.levelsToShow) {
                    continue;
                }

                const link = title.toLocaleLowerCase()
                    .replace(/\s/g, "-")
                    .replace(/[^A-Za-z0-9-_]/g, "");
                const menu = `${"  ".repeat(level - topLevel)}- [${title}](#${link})`;
                this.menus.push(menu);

                previous = null;
            } else {
                previous = trimmed;
            }
        }
    }
}