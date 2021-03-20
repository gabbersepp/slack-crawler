/// <reference types="cypress" />

describe("Read everything from slack", () => {

    let idsForThreads = [];
    let channels = [];
    let ims = [];

    beforeEach(() => {
        const config = Cypress.config().customConfig;
        cy.setCookie("OptanonAlertBoxClosed", "2021-01-26T07:44:07.032Z")
        cy.setCookie("OptanonConsent", "landingPath=NotLandingPage&datestamp=Tue+Jan+26+2021+08%3A44%3A07+GMT%2B0100+(Mitteleurop%C3%A4ische+Normalzeit)&version=6.10.0&groups=C0004%3A1%2CC0002%3A1%2CC0003%3A1%2CC0001%3A1&hosts=&consentId=45bf2a2d-a5f2-489c-ac7b-0c41e112469e&interactionCount=1")
        cy.setCookie("OptanonAlertBoxClosed", "2021-01-26T12:54:41.449Z")
        cy.setCookie("shown_ssb_redirect_page", "1")
        cy.setCookie("shown_download_ssb_modal", "1")

        cy.visit("https://slack.com/workspace-signin")
        cy.get("input[data-qa='signin_domain_input']").type(config.workspace);
        cy.get("button[data-qa='submit_team_domain_button']").click();

        cy.get("input[data-qa='login_email']").type(config.user)
        cy.get("input[data-qa='login_password']").type(config.pwd)

        
        cy.intercept("POST", /.*users\/list.*/i).as("users");
        cy.intercept("POST", /.*client\.counts.*/i).as("clientCounts");
        cy.intercept("POST", /.*client\.boot.*/i).as("clientBoot");
        cy.intercept("POST", /.*conversations\.history.*/i).as("history")
        cy.intercept("POST", /.*conversations\.replies.*/i).as("replies")

        cy.get("button[data-qa='signin_button']").click();
        //cy.get("button[data-qa='continue_in_browser']").click()
        cy.visit(`https://${config.workspace}.slack.com/`)
    })

    it("Read channels and ims", () => {
        const config = Cypress.config().customConfig;
        cy.wait("@clientBoot").then(result => {
            channels = result.response.body.channels.map(u => ({ id: u.id, name: u.name }));
            ims = result.response.body.ims.map(u => ({ id: u.id, user: u.user }));

            cy.writeFile(`${config.crawler.dataDir}/channels/channels.json`, JSON.stringify(channels));
            cy.writeFile(`${config.crawler.dataDir}/channels/ims.json`, JSON.stringify(ims));
        })
    })

    const usersArray = [];

    // click onto every channel to get every user
    it("Read all users", () => {
        const config = Cypress.config().customConfig;

        cy.on("fail", (error) => {
            // the last wait() will fail. This is intended because we do not know when then last one occurs
            if (error.name === "CypressError"
                && error.message.toString()
                                .match(/.*timed out waiting `.*` for the .* request to the route: `users`.*/)) {

                return false;
            }
        });

        let last = cy.wrap({});

        channels.forEach(c => {
            last = last.then(() => 
                cy.visit(`https://app.slack.com/client/${config.teamId}/${c.id}`).wait(5000));
        });

        waitAndReadUsers(usersArray);
    })

    it("Save users", () => {
        const config = Cypress.config().customConfig;
        cy.writeFile(`${config.crawler.dataDir}/users/users.json`, JSON.stringify(distinct(usersArray, x => x.id)));
    })

    it("Read messages", () => {
        const config = Cypress.config().customConfig;

        cy.on("fail", (error) => {
            // the last wait() will fail. This is intended because we do not know when then last one occurs
            if (error.name === "CypressError"
                && error.message.toString()
                                .match(/.*timed out waiting `.*` for the .* request to the route: `users`.*/)) {
                return false;
            }
        });
        
        let last = cy.wrap({});
        let channelIds = [...channels, ...ims].map(x => x.id);

        if (config.takeOnly) {
            channelIds = channelIds.slice(0, config.takeOnly)
        }

        channelIds.forEach(c => {
            last = last.then(() => 
                cy.visit(`https://app.slack.com/client/${config.teamId}/${c}`).wait(5000)
                .then(() => scroll()))
        })

        // wait for "history" requests until no one occures anymore
        waitAndWriteMessages(config.crawler.dataDir);
    })

    it("Read threads", () => {
        cy.on("fail", (error) => {
            // the last wait() will fail. This is intended because we do not know when then last one occurs
            if (error.name === "CypressError"
                && error.message.toString()
                                .match(/.*timed out waiting `.*` for the .* request to the route: `replies`.*/)) {
                return false;
            }
        });
        cy.writeFile("./threadids.json", JSON.stringify(idsForThreads));
        
        const config = Cypress.config().customConfig;
        let last = cy.wrap({});
        idsForThreads.forEach(i => {
            last = last.then(() => {
                const channel = /(.*)-.*/.exec(i)[1]
                cy.visit(`https://app.slack.com/client/${config.teamId}/${channel}/thread/${i}`).wait(5000);
            })
        })
        waitAndWriteThreads(config.crawler.dataDir);
    })
    
    function distinct(list, fn) {
        const obj = {};
        list.forEach(x => obj[fn(x)] = x);
        return Object.values(obj);
    }

    function scroll() {
        return new Promise(async resolve => {
            for(let i = 0; i < 50; i++) {
                // should be enough :-)
                // scroll as long as we reach the top
                Cypress.$(".c-scrollbar__hider")[1].scrollTo(0, 0)
                if (Cypress.$("div[id='0000000000\.000001']").length > 0) {
                    // this is a fake item which will be added over the top most message
                    break;
                }
                await sleep(500)
            }
            resolve()
        })
    }

    function sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

    function waitAndReadUsers(usersArray) {
        cy.wait("@users").then(result => {
            const users = result.response.body.results.map(u => ({ id: u.id, name: u.name }));
            usersArray.push(...users);
            waitAndReadUsers(usersArray);
        });
    }

    function waitAndWriteMessages(dataDir) {
        cy.wait("@history").then(obj => {
            if (obj.request.body) {
                var formData = new TextDecoder("utf-8").decode(obj.request.body)
                if (formData) {
                    var channel = /channel\"\s+([a-z0-9]{9})/gi.exec(formData)
                    if (channel && channel.length >= 2) {
                        channel = channel[1];
                        const body = obj.response.body;
                        
                        body.messages.forEach(m => {
                            if (m.reply_count > 0) {
                                idsForThreads.push(`${channel}-${m.thread_ts}`);
                            }
                        })
                        
                        cy.writeFile(`${dataDir}/messages-temp/${new Date().getTime()}_${channel}.json`, JSON.stringify(obj.response.body))
                    }
                }
            }

            waitAndWriteMessages(dataDir);
        })
    }

    function waitAndWriteThreads(dataDir) {
        cy.wait("@replies").then(obj => {
            if (obj.request.body) {
                var formData = new TextDecoder("utf-8").decode(obj.request.body)
                if (formData) {
                    var channel = /channel\"\s+([a-z0-9]{9})/gi.exec(formData)
                    if (channel && channel.length >= 2) {
                        channel = channel[1];
                        
                        cy.writeFile(`${dataDir}/threads-temp/${new Date().getTime()}_${channel}.json`, JSON.stringify(obj.response.body))
                    }
                }

            }

            waitAndWriteThreads(dataDir);
        })
    }
})