// ******* SEARCH INSTANTSEARCH.JS SETUP *******

// Configuration object for different providers
let currentProvider = 'meilisearch';
let search = null;

// Initialize search based on provider
function initializeSearch(provider) {
    currentProvider = provider;
    
    // Clear existing search instance
    if (search) {
        search.dispose();
    }

    const containerElement = document.querySelector('#searchbox').parentElement;
    
    try {
        if (provider === 'algolia') {
            initAlgolia();
        } else if (provider === 'meilisearch') {
            initMeilisearch();
        } else if (provider === 'typesense') {
            initTypesense();
        }
        console.log(`✓ Switched to ${provider} provider`);
    } catch (error) {
        console.error(`Error initializing ${provider}:`, error);
        showError(`Failed to initialize ${provider}. Check your configuration.`);
    }
}

function initAlgolia() {
    const { appId, searchKey, indexName } = config_search.algolia;
    
    if (appId === 'APP_ID' || searchKey === 'SEARCH_KEY') {
        showError('Please configure your Algolia credentials in the config object');
        return;
    }

    const searchClient = algoliasearch(appId, searchKey);
    
    search = instantsearch({
        indexName: indexName,
        searchClient,
        insights: true
    });

    addWidgets();
    search.start();
}

function initMeilisearch() {
    const { url, apiKey, indexName } = config_search.meilisearch;
    
    if (url === 'http://localhost:7700' || apiKey === 'MEILISEARCH_KEY') {
        showError('Please configure your Meilisearch credentials in the config object');
        return;
    }

    const { searchClient } = instantMeiliSearch(
        url,
        apiKey
    );

    search = instantsearch({
        indexName: indexName,
        searchClient
    });

    addWidgets();
    search.start();
}

function initTypesense() {
    const { url, apiKey, nodes, indexName } = config_search.typesense;
    
    if (apiKey === 'TYPESENSE_API_KEY') {
        showError('Please configure your Typesense credentials in the config object');
        return;
    }

    const adapter = new TypesenseInstantSearchAdapter({
        server: {
            apiKey: apiKey,
            nodes: nodes.length > 0 ? nodes : [{
                host: 'localhost',
                port: 8108,
                protocol: 'http'
            }]
        },
        additionalSearchParameters: {
            query_by: 'title,description'
        }
    });

    const searchClient = adapter.getSearchClient();

    search = instantsearch({
        indexName: indexName,
        searchClient
    });

    addWidgets();
    search.start();
}

const customSearchBox = instantsearch.connectors.connectSearchBox((renderOptions, isFirstRender) => {
    const { query, refine } = renderOptions;
    const input = document.getElementById("q");

    if (isFirstRender) {
        const bt_search = document.getElementById("openSearch");
        const bt_search_m = document.getElementById("openSearch-m");
        const sidebar = document.getElementById("sidebar");
        const sidebar_facets = document.getElementById("sidebar-facets");
        const sidebar_settings = document.getElementById("sidebar-options");
        const sidebar_search = document.getElementById("sidebar-search");

        bt_search.addEventListener("click", () => {
            input.focus();
        });
        bt_search_m.addEventListener("click", () => {
            sidebar.classList.remove("hidden");
            input.focus();
        });

        input.addEventListener("input", (event) => {
            refine(event.target.value);
        });

        input.addEventListener("focus", () => {
            sidebar_search.classList.remove("hidden");
            sidebar_facets.classList.add("hidden");
            sidebar_settings.classList.add("hidden");
        });
    }

    if (input.value !== query) {
      input.value = query;
    }
});

function addWidgets() {
    search.addWidgets([
        // instantsearch.widgets.searchBox({
        //     container: '#searchbox',
        //     placeholder: 'Search...',
        //     autofocus: true,
        //     templates: {

        //     }
        // }),
        customSearchBox({}),
        instantsearch.widgets.stats({
            container: '#stats'
        }),
        
        instantsearch.widgets.hits({
            container: '#hits',
            templates: {
                item: `
                    <div class="flex gap-4">
                        {{#imageUrl}}<img src="{{imageUrl}}" alt="{{title}}" class="w-20 h-20 object-cover rounded">{{/imageUrl}}
                        <div class="flex-1">
                            <h3 class="font-semibold text-lg text-gray-900 mb-1">{{title}}</h3>
                            {{description}}
                            
                            {{#link}}<a href="{{link}}" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm font-medium mt-2 inline-block">Listen →</a>{{/link}}
                        </div>
                    </div>
                `,
                empty: `
                    <div class="text-center py-12">
                        <p class="text-gray-500">No results found</p>
                    </div>
                `
            }
        }),
        
        instantsearch.widgets.pagination({
            container: '#pagination'
        })
    ]);
}

// Initialize with Algolia by default
document.addEventListener('DOMContentLoaded', () => {
    // GLOBAL VARIABLES
    const bt_settings = document.getElementById("openSettings");
    const bt_settings_m = document.getElementById("openSettings-m");
    const sidebar = document.getElementById("sidebar");
    const sidebar_facets = document.getElementById("sidebar-facets");
    const sidebar_settings = document.getElementById("sidebar-options");
    const sidebar_search = document.getElementById("sidebar-search");
    const closeSidebarMobile = document.getElementById("closeSidebarMobile");

    // SETTINGS BUTTON
    bt_settings.addEventListener("click", () => {
        sidebar_settings.classList.remove("hidden");
        sidebar_facets.classList.add("hidden");
        sidebar_search.classList.add("hidden");
    });

    bt_settings_m.addEventListener("click", () => {
        sidebar.classList.remove("hidden");
        sidebar_settings.classList.remove("hidden");
        sidebar_facets.classList.add("hidden");
        sidebar_search.classList.add("hidden");
    });

    // CLOSE SIDEBAR ON MOBILE
    closeSidebarMobile && closeSidebarMobile.addEventListener("click", () => {
        sidebar.classList.add("hidden");
    });

    // DARK MODE SCRIPT 
    const root = document.documentElement;
    const toggle_dark = document.getElementById("appearance-switcher");

    toggle_dark.addEventListener("click", () => {
        root.classList.toggle("dark");
        localStorage.setItem("darkMode", root.classList.contains("dark") ? "true" : "false");
    });

    /* Load stored preference */
    if (localStorage.getItem("darkMode") === "true") {
        root.classList.add("dark");
    }

    // SIDEBAR TOGGLE
    const toggle_sidebar = document.getElementById("openMenu");
    const toggle_mini = document.getElementById("openMiniMenu");
    const buttons = document.getElementById("navbar-buttons");

    toggle_sidebar && toggle_sidebar.addEventListener("click", () => {
        sidebar.classList.toggle("md:block");
        localStorage.setItem("sidebar", sidebar.classList.contains("md:block") ? "open" : "close");
    });

    toggle_mini && toggle_mini.addEventListener("click", () => {
        sidebar.classList.toggle("w-80");
        buttons.classList.toggle("grid");

        const text = document.querySelectorAll(".menu-text");
        text.forEach(t => t.classList.toggle("hidden"));

        localStorage.setItem("sidebar", sidebar.classList.contains("w-80") ? "open" : "mini");
    });

    /* Load stored preference */
    if (localStorage.getItem("sidebar") === "close") {
        sidebar && sidebar.classList.remove("md:block");
    } if (localStorage.getItem("sidebar") === "mini") {
        sidebar && sidebar.classList.remove("w-80");
        buttons.classList.add("grid");
        const text = document.querySelectorAll(".menu-text");
        text.forEach(t => t.classList.toggle("hidden"));
    }

    initializeSearch(currentProvider);
});