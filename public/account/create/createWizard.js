(function () {
    const $ = document.querySelector.bind(document);
    class Validator {
        init() { }
        username() { }
        password(str) {
            if (str.length <= 8) return 0;
            if (str.length >= 32) return 1;
            if (str.match(/[0-9]/g) !== null) return 2;
        }
    }
    let v = new Validator();

    class Wizard {
        init() {
            this.curPage = 0;
            this.lastMove = 0;
            this.buttons = {
                unset: [{
                    "name": "Previous",
                    info: 0b000
                }, {
                    'name': 'OK',
                    info: 0b111
                }],
                bitfield: {
                    action: 0b100,
                    width: 0b010,
                    color: 0b001
                },
            }

            let inputs = {
                username: this.element('input', null, [['placeholder', 'Username'], ['type', 'text']])
            }
            let requirementList = {
                username: [this.element('ul'), [0, 3, 5, 6]],
                password: [this.element('ul'), [1, 2, 4]],
            }
            let reqs = [
                'At least 3 characters',
                'At least 8 characters',
                'At most 32 characters',     // 2
                'At most 16 characters',     // 3
                'Contain at least one number',// 4
                'Must not contain special characters', // 5
                'Must not contain spaces'    // 6
            ]
            reqs.forEach((reqStr, i) => {
                for (const req in requirementList) {
                    let [el, reqarr] = requirementList[req];
                    if (reqarr.includes(i)) el.append(this.element('li', reqStr))
                }
            })
            this.pages = [
                this.page({
                    title: "Create an account",
                    description: 'We\'ll get you up and running in no time.',
                    buttons: [
                        {
                            name: "Begin",
                            info: 0b110
                        }
                    ]
                }),
                this.page({
                    title: "Username",
                    description: 'Enter your username',
                    extraNodes: [
                        requirementList.username[0],
                        inputs.username,
                    ],
                    onsubmit: v.username(inputs.username.value)
                }),
                this.page({
                    title: "Password",
                    description: 'Enter your password. This must be:',
                    extraNodes: [
                        requirementList.password[0],
                        this.element('input', null, [['placeholder', 'Password'], ['type', 'password']]),
                        this.element('input', null, [['placeholder', 'Confirm password'], ['type', 'password']])
                    ]
                }),
                this.page({
                    title: "Display Name",
                    description: 'A simple handle to easily identify you. You can have the same display name as another user.',
                    extraNodes: [
                        this.element('input', null, [['placeholder', 'Display Name'], ['type', 'text']]),
                    ],
                    skip: true
                })
            ]
            this.root = $('.account-box#create');
            
            this.root.append(this.pages[0]);
            setTimeout(()=>this.pages[0].querySelector('h1').classList.remove('right'));
            this.root.style.height = this.pages[0].getBoundingClientRect().height + 40 + 'px';
        }
        element(tag, value, attrs) {
            let el = document.createElement(tag);
            if (attrs) attrs.forEach(attr => {
                if (!attr.length === 2) return;
                el.setAttribute(...attr);
            })
            el.innerHTML = value || '';
            return el;
        }
        nextPage(rev) {
            // If the user last clicked something less than 550ms ago...
            // stop. that's spamming, and it breaks the UI. :)
            if (this.lastMove > Date.now() - 550) return;
            this.lastMove = Date.now()
            let left = 'left', right = 'right';
            if (rev) left = 'right', right = 'left' // tell left that it's right and right that it's left. deception 100 
            // The index to move to
            let newInd = this.curPage + (rev ? -1 : 1);
            let inner = {
                cur: this.pages[this.curPage], // Current index
                toMoveTo: this.element('div', null,
                    [['class', 'account-create-box-inner']]) // to move to
            };

            if (this.pages[newInd]) inner.toMoveTo = this.pages[newInd]
            else this.finish();
            // hide the new one off screen before it gets added to the document
            inner.toMoveTo.classList.add('is-' + right);
            // add the new hidden page to the document
            this.root.append(inner.toMoveTo);

            // move the old one left
            inner.cur.classList.add('is-' + left);
            // animate out the title
            inner.cur.querySelector('h1').classList.add('right')
            setTimeout(function () {
                // to move to = center
                inner.toMoveTo.classList.remove('is-' + right);
                // Adjust height
                this.root.style.height = inner.toMoveTo.getBoundingClientRect().height + 40 + 'px';
                // Animate in the title
                inner.toMoveTo.querySelector('h1').classList.remove('right')
                setTimeout(function () {
                    // Remove the current one
                    inner.cur.remove();
                    inner.cur.classList.remove('is-' + left)// for if the user chooses previous later
                }, 500)
            }.bind(this))
            this.curPage += (rev ? -1 : 1);
        }
        finish() { }
        page(obj) {
            // Destructure some objects so we don't have to type out "this.element" or similar
            let { element, nextPage } = this;
            let { bitfield, unset } = this.buttons;
            const buttons = obj.buttons || unset;
            // Initialize the container
            let page = element('div', null, [['class', 'account-create-box-inner']]);
            // Subtitle (or "supertitle"? it's before the title)
            if (this.curPage !== 0) page.append(element('h3', 'Create an account',[['class','subtitle']]));
            // The title itself (animate it in)
            page.append(element('h1', obj.title, [['class', 'animate-in right']]), obj.description ? element('p', obj.description) : '');
            // If this page has extra nodes, add them all
            if (obj.extraNodes) obj.extraNodes.forEach(node => page.append(node));
            let buttonContainer = element('div', null, [['class', 'button-container']]);
            // Add each button to the container
            buttons.forEach(buttonStruct => {
                var classes = []
                classes.push(
                    'button',
                    buttonStruct.info & bitfield.width ? 'full-width' : 'not-full-width'
                );
                if (!(buttonStruct.info & bitfield.color)) classes.push('grey');
                var buttonel = element('button', buttonStruct.name, [['class', classes.join(' ')]]);

                // If there's an action specified, add it
                if (buttonStruct.action) buttonel.addEventListener('click', buttonStruct.action);
                // If the bitfield action is 0, go backwards 1 page
                else if (!(buttonStruct.info & bitfield.action)) buttonel.onclick = nextPage.bind(this, true);
                // If it's not 0 go forwards 1 page
                else buttonel.onclick = nextPage.bind(this, null); // null is required because MouseEvent gets sent otherwise, and that's truthy
                buttonContainer.append(buttonel)
                page.append(buttonContainer);
            });
            if (obj.skip) {
                let skip = element('a', 'Skip', [['class', 'skip']])
                skip.onclick = nextPage.bind(this, null);
                page.append(skip);
            }
            return page
        }
    }
    let w = new Wizard();
    w.init();
})()