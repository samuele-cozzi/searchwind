// Configuration object for different providers
let search = null;
let fuse_indexed = false;

// UTILITIES
function fetchJSON(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}


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
        } else if (provider === 'fuse') {
            initFuse();
        }
        console.log(`✓ Switched to ${provider} provider`);
    } catch (error) {
        console.error(`Error initializing ${provider}:`, error);
        //showError(`Failed to initialize ${provider}. Check your configuration.`);
    }
}

function initFuse() {
    const input_search = document.getElementById("q");
    buildFuseIndex(input_search);
    input_search.onkeyup = function (event) {
        console.log("searching ...");
        executeFuseQuery(this.value);
    };
}

function buildFuseIndex(input_search) {
  var baseURL = input_search.getAttribute("data-baseurl");
  baseURL = baseURL.replace(/\/?$/, "/");
  fetchJSON(baseURL + "index.json", function (data) {
    var options = {
      shouldSort: true,
      ignoreLocation: true,
      threshold: 0.0,
      includeMatches: true,
      keys: [
        { name: "title", weight: 0.8 },
        { name: "section", weight: 0.2 },
        { name: "summary", weight: 0.6 },
        { name: "content", weight: 0.4 },
      ],
    };
    search = new Fuse(data, options);
    fuse_indexed = true;
  });
}

function executeFuseQuery(term) {
  let results = search.search(term);
  let resultsHTML = "";

  if (results.length > 0) {
    results.forEach(function (value, key) {
      var linkconfig = value.item.source
        ? 'target="_blank" rel="noopener" href="' + value.item.source + '"'
        : 'href="' + value.item.permalink + '"';
      var linktype = value.item.source
        ? value.item.source.replace(/^(?:.*:\/\/)?([^\/]+).*/, "$1")
        : value.item.type;
      resultsHTML =
        resultsHTML +
        `<article class="item-container bg-background-card rounded-lg m-1 relative">
            <div class="item-link flex">    
                <a ${linkconfig} class="flex flex-col w-full">
                    <div class="flex flex-col md:flex-row py-3 pr-3">
                        <!-- TITLE -->
                        <spam href="${value.item.permalink}" class="item-title px-3 pt-3 pb-1 text-m font-semibold text-primary max-w-64 truncate">
                            ${value.item.title}
                        </span>
                    </div>
                    <div href="${value.item.source}" target="_blank" class="item-tags text-muted px-3 py-2 text-xs truncate border-t border-background">
                        <!-- EXTERNAL LINK -->
                        <span>
                        ${linktype}
                        </span>
                        <!-- DATE -->
                        <span class="float-right">${value.item.date}</span>
                    </div>
                </a>
            </div>
        </article>`;
    });
    //hasResults = true;
  } else {
    resultsHTML = "";
    //hasResults = false;
  }

  document.getElementById("search-hits").innerHTML = resultsHTML;
//   if (results.length > 0) {
//     first = output.firstChild.firstElementChild;
//     last = output.lastChild.firstElementChild;
//   }
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
            container: '#search-stats'
        }),
        
        instantsearch.widgets.hits({
            container: '#search-hits',
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
            container: '#search-pagination'
        })
    ]);
}

document.addEventListener('DOMContentLoaded', () => {
    // GLOBAL VARIABLES
    const bt_settings = document.getElementById("openSettings");
    const bt_settings_m = document.getElementById("openSettings-m");
    const sidebar = document.getElementById("sidebar");
    const sidebar_facets = document.getElementById("sidebar-facets");
    const sidebar_settings = document.getElementById("sidebar-options");
    const sidebar_search = document.getElementById("sidebar-search");
    const closeSidebarMobile = document.getElementById("closeSidebarMobile");
    const main_content = document.getElementById("main-content");

    // SETTINGS BUTTON
    bt_settings.addEventListener("click", () => {
        sidebar_settings.classList.remove("hidden");
        sidebar_facets.classList.add("hidden");
        sidebar_search.classList.add("hidden");
        main_content.classList.remove("hidden");
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
        main_content.classList.remove("hidden");
    });

    // DARK MODE SCRIPT 
    const root = document.documentElement;
    const toggle_dark = document.getElementById("appearance-switcher");

    toggle_dark.addEventListener("click", () => {
        root.classList.toggle("dark");
        localStorage.setItem("darkMode", root.classList.contains("dark") ? "true" : "false");
    });

    // SIDEBAR TOGGLE
    const toggle_sidebar = document.getElementById("openMenu");
    const sidebar_title = document.getElementById("sidebar-title");
    const toggle_mini = document.getElementById("openMiniMenu");
    const buttons = document.getElementById("navbar-buttons");

    toggle_sidebar && toggle_sidebar.addEventListener("click", () => {
        sidebar.classList.toggle("md:block");
        main_content.classList.remove("hidden");
        localStorage.setItem("sidebar", sidebar.classList.contains("md:block") ? "open" : "close");
    });

    toggle_mini && toggle_mini.addEventListener("click", () => {
        buttons.classList.toggle("grid");
        main_content.classList.remove("hidden");

        const text = document.querySelectorAll(".menu-text");
        text.forEach(t => t.classList.toggle("hidden"));

        localStorage.setItem("sidebar", sidebar_title.classList.contains("hidden") ? "mini" : "open");
    });

    // SEARCHBAR
    document.getElementById("q").addEventListener('input', (event) => {
        if (event.target.value.trim() !== '') {
            document.getElementById("list-items").classList.add("hidden");
            document.getElementById("search-results").classList.remove("hidden");
        } else {
            document.getElementById("list-items").classList.remove("hidden");
            document.getElementById("search-results").classList.add("hidden");
        }
    });

    /* Load stored preference */
    if (localStorage.getItem("sidebar") === "close") {
        sidebar && sidebar.classList.remove("md:block");
    } if (localStorage.getItem("sidebar") === "mini") {
        buttons.classList.add("grid");
        const text = document.querySelectorAll(".menu-text");
        text.forEach(t => t.classList.toggle("hidden"));
    }

    initializeSearch(currentProvider);
});