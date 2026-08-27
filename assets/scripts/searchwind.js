// Configuration object for different providers
const searchbox_id = "q";
let search = null;
let fuse_indexed = false;
let selectedIndex = -1;
const classSelected = "border-secondary";

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

// FUSE 
function initFuse() {
    const input_search = document.getElementById(searchbox_id);
    buildFuseIndex(input_search);
    input_search.onkeyup = function (event) {
        if(event.key != "ArrowDown" && event.key != "ArrowUp" && event.key != "Enter") {
            executeFuseQuery(this.value);
        }
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
        `<article class="item-container bg-background-card rounded-lg m-1 border-2 relative">
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

// INSTANTSEARCH.JS
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
                    <article class="item-container bg-background-card rounded-lg m-1 border-2 relative">
                        <div class="item-link flex">    
                            <a href="{{url}}" target="_blank" class="flex flex-col w-full">
                                <div class="flex flex-col md:flex-row py-3 pr-3">
                                    <!-- TITLE -->
                                    <spam class="item-title px-3 pt-3 pb-1 text-m font-semibold text-primary max-w-64 truncate">
                                        {{title}}
                                    </span>
                                </div>
                                <div target="_blank" class="item-tags text-muted px-3 py-2 text-xs truncate border-t border-background">
                                    <!-- EXTERNAL LINK -->
                                    <span>
                                        link
                                    </span>
                                    <!-- DATE -->
                                    <span class="float-right">2025-01-01</span>
                                </div>
                            </a>
                        </div>
                    </article>
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

// SEARCH KEYBOARD
document.addEventListener("keydown", function (event) {
    // Check if Ctrl, Shift, and P are pressed
    if (event.ctrlKey && event.shiftKey && event.key === "P") {
        event.preventDefault(); // Prevent default browser behavior (e.g., opening print dialog)
        document.getElementById(searchbox_id).focus();
    }

    // Esc to close search wrapper
    if (event.key == "Escape") {
        document.getElementById(searchbox_id).value = "";
        document.getElementById(searchbox_id).blur();
        document.getElementById("list-items").classList.remove("hidden");
        document.getElementById("search-results").classList.add("hidden");
    }

    // Down arrow to move down results list
    if (event.key == "ArrowDown") {
        event.preventDefault();
        const articles = document.querySelectorAll("#search-hits article");

        // If there are no articles, do nothing
        if (articles.length === 0) return;

        // Remove "selected" from the currently selected article (if any)
        if (selectedIndex >= -1 && selectedIndex < articles.length) {
            (selectedIndex >= 0) ? articles[selectedIndex].classList.remove(classSelected) : null;
        }

        // Move to the next article (or wrap around to the first)
        selectedIndex = (selectedIndex + 1) % articles.length;

        // Add "selected" to the new article
        articles[selectedIndex].classList.add(classSelected);
    }

    // Up arrow to move up results list
    if (event.key == "ArrowUp") {
        event.preventDefault();
        const articles = document.querySelectorAll("#search-hits article");

        // If there are no articles, do nothing
        if (articles.length === 0) return;

        // Remove "selected" from the currently selected article (if any)
        if (selectedIndex >= -1 && selectedIndex < articles.length) {
            (selectedIndex >= 0) ? articles[selectedIndex].classList.remove(classSelected) : null;
        }

        // Move to the next article (or wrap around to the first)
        selectedIndex = (selectedIndex - 1) % articles.length;

        // Add "selected" to the new article
        (selectedIndex >= 0) ? articles[selectedIndex].classList.add(classSelected) : null;
    }

    // Enter to get to results
    if (event.key == "Enter") {
        if (!document.getElementById("search-results").classList.contains("hidden")){
            event.preventDefault();

            let selectedArticle = document.querySelector("#search-hits ." + classSelected);

            (selectedArticle) ? window.open(selectedArticle.querySelector('a').href, '_blank', 'noopener,noreferrer') :
                window.open(document.getElementById("search-hits").firstChild.querySelector('a').href, '_blank', 'noopener,noreferrer');
        }
    }
});

// DOCUMENT LOAD
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
    bt_settings?.addEventListener("click", () => {
        sidebar_settings.classList.remove("hidden");
        sidebar_facets.classList.add("hidden");
        sidebar_search.classList.add("hidden");
        main_content.classList.remove("hidden");
    });

    bt_settings_m?.addEventListener("click", () => {
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

    // COLUMN NUMBER SCRIPT
    const input_list_column_number = document.getElementById('list-colums-number');

    input_list_column_number && (input_list_column_number.value = localStorage.getItem('listColsNumber') ?? ((window.innerWidth <= 768) ? currentGridColsMobile : currentGridCols));
    input_list_column_number?.addEventListener('input', () => {
        const cols = parseInt(input_list_column_number.value, 10) || 1;
        document.getElementById('my-grid').style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        localStorage.setItem("listColsNumber", cols);
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
    document.getElementById(searchbox_id).addEventListener('input', (event) => {
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