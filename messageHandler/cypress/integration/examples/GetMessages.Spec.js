/// <reference types="cypress" />

describe("Bla", () => {

    it("bla", (done) => {
        const config = Cypress.config().customConfig;

        cy.on("fail", (error) => {
            // the last wait() will fail. This is intended because we do not know when then last one occurs
            if (error.name === "CypressError"
                && error.message.toString()
                                .match(/.*timed out waiting `.*` for the .* request to the route: `history`.*/)) {
                    done();
            }
        });

        cy.setCookie("OptanonAlertBoxClosed", "2021-01-26T07:44:07.032Z")
        cy.setCookie("OptanonConsent", "landingPath=NotLandingPage&datestamp=Tue+Jan+26+2021+08%3A44%3A07+GMT%2B0100+(Mitteleurop%C3%A4ische+Normalzeit)&version=6.10.0&groups=C0004%3A1%2CC0002%3A1%2CC0003%3A1%2CC0001%3A1&hosts=&consentId=45bf2a2d-a5f2-489c-ac7b-0c41e112469e&interactionCount=1")
        cy.setCookie("OptanonAlertBoxClosed", "2021-01-26T12:54:41.449Z")
        cy.setCookie("shown_ssb_redirect_page", "1")
        cy.setCookie("shown_download_ssb_modal", "1")

        cy.visit("https://slack.com/workspace-signin")
        cy.get("input[data-qa='signin_domain_input']").type("sagswe");
        cy.get("button[data-qa='submit_team_domain_button']").click();

        cy.get("input[data-qa='login_email']").type(config.user)
        cy.get("input[data-qa='login_password']").type(config.pwd)

        cy.intercept("POST", /.*users\/list.*/i).as("users");
        cy.intercept("POST", /.*client\.counts.*/i).as("clientCounts");
        cy.intercept("POST", /.*client\.boot.*/i).as("clientBoot");

        cy.get("button[data-qa='signin_button']").click();
        //cy.get("button[data-qa='continue_in_browser']").click()
        cy.visit("https://sagswe.slack.com/")

        cy.wait("@clientBoot").then(result => {
            const channelList = result.response.body.channels.map(u => ({ id: u.id, name: u.name }));
            cy.writeFile(`${config.crawler.dataDir}/channels/channels.json`, JSON.stringify(channelList));
        })
        cy.wait("@users").then(result => {
            const userList = result.response.body.results.map(u => ({ id: u.id, name: u.name }));
            cy.writeFile(`${config.crawler.dataDir}/users/users.json`, JSON.stringify(userList));
        })
        cy.wait("@clientCounts").then(result => {
            const body = result.response.body;
            let channelIds = body.channels.map(x => x.id)
            channelIds.push(...body.ims.map(x => x.id))

            let last = cy.wrap({});

            cy.intercept("POST", /.*conversations\.history.*/i).as("history")

            if (config.takeOnly) {
                channelIds = channelIds.slice(0, config.takeOnly)
            }

            channelIds.forEach(c => {
                last = last.then(() => visit(c).then(() => scroll()))
            })

            // wait for "history" requests until no one occures anymore
            waitAndWrite(config.crawler.dataDir);
        })
    })

    function scroll() {
        return new Promise(async resolve => {
            for(let i = 0; i < 50; i++) {
                debugger;
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
    function waitAndWrite(dataDir) {
        cy.wait("@history").then(obj => {
            if (obj.request.body) {
                var formData = new TextDecoder("utf-8").decode(obj.request.body)
                if (formData) {
                    var channel = /channel\"\s+([a-z0-9]{9})/gi.exec(formData)
                    if (channel && channel.length >= 2) {
                        channel = channel[1];
                        
                        cy.writeFile(`${dataDir}/messages-temp/${new Date().getTime()}_${channel}.json`, JSON.stringify(obj.response.body))
                    }
                }

            }

            waitAndWrite(dataDir);
        })
    }

    function visit(id) {
        return cy.visit(`https://app.slack.com/client/T04PTB2HM/${id}`).wait(5000)
    }
})