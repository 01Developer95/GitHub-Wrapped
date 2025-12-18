/**
 * GitHub Wrapped - Your Coding Year in Review
 * 
 * Copyright (c) 2024-2025 01Developer95
 * Licensed under the MIT License
 * 
 * Project: GitHub Wrapped
 * Repository: https://github.com/01Developer95/GitHub-Wrapped
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Slides Generation Module
class Slides {
    // Helper to get GitHub Octicons
    static getIcon(name, size = 64) {
        const icons = {
            'graph': `<path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"></path>`,
            'calendar': `<path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5Zm10.75-4H2.75a.25.25 0 0 0-.25.25V6h11V3.75a.25.25 0 0 0-.25-.25Z"></path>`,
            'flame': `<path d="M9.32 15.653a.812.812 0 0 1-.086-.855c.176-.342.245-.733.2-1.118a2.106 2.106 0 0 0-.267-.779 2.027 2.027 0 0 0-.541-.606 3.96 3.96 0 0 1-1.481-2.282c-1.708 2.239-1.053 3.51-.235 4.63a.748.748 0 0 1-.014.901.87.87 0 0 1-.394.283.838.838 0 0 1-.478.023c-1.105-.27-2.145-.784-2.85-1.603a4.686 4.686 0 0 1-.906-1.555 4.811 4.811 0 0 1-.263-1.797s-.133-2.463 2.837-4.876c0 0 3.51-2.978 2.292-5.18a.621.621 0 0 1 .112-.653.558.558 0 0 1 .623-.147l.146.058a7.63 7.63 0 0 1 2.96 3.5c.58 1.413.576 3.06.184 4.527.325-.292.596-.641.801-1.033l.029-.064c.198-.477.821-.325 1.055-.013.086.137 2.292 3.343 1.107 6.048a5.516 5.516 0 0 1-1.84 2.027 6.127 6.127 0 0 1-2.138.893.834.834 0 0 1-.472-.038.867.867 0 0 1-.381-.29zM7.554 7.892a.422.422 0 0 1 .55.146c.04.059.066.126.075.198l.045.349c.02.511.014 1.045.213 1.536.206.504.526.95.932 1.298a3.06 3.06 0 0 1 1.16 1.422c.22.564.25 1.19.084 1.773a4.123 4.123 0 0 0 1.39-.757l.103-.084c.336-.277.613-.623.813-1.017.201-.393.322-.825.354-1.269.065-1.025-.284-2.054-.827-2.972-.248.36-.59.639-.985.804-.247.105-.509.17-.776.19a.792.792 0 0 1-.439-.1.832.832 0 0 1-.321-.328.825.825 0 0 1-.035-.729c.412-.972.54-2.05.365-3.097a5.874 5.874 0 0 0-1.642-3.16c-.156 2.205-2.417 4.258-2.881 4.7a3.537 3.537 0 0 1-.224.194c-2.426 1.965-2.26 3.755-2.26 3.834a3.678 3.678 0 0 0 .459 2.043c.365.645.89 1.177 1.52 1.54C4.5 12.808 4.5 10.89 7.183 8.14l.372-.25z"></path>`,
            'code': `<path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.215 1.275.749.749 0 0 1-1.075-.215l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25Z"></path>`,
            'clock': `<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path>`,
            'rocket': `<path d="M14.064 0h.186C15.216 0 16 .784 16 1.75v.186a8.752 8.752 0 0 1-2.564 6.186l-.458.458c-.314.314-.641.616-.979.904v3.207c0 .608-.315 1.172-.833 1.49l-2.774 1.707a.749.749 0 0 1-1.11-.418l-.954-3.102a1.214 1.214 0 0 1-.145-.125L3.754 9.816a1.218 1.218 0 0 1-.124-.145L.528 8.717a.749.749 0 0 1-.418-1.11l1.71-2.774A1.748 1.748 0 0 1 3.31 4.002h3.207c.288-.338.59-.665.904-.979l.458-.458A8.749 8.749 0 0 1 14.064 0ZM8.938 1.623c-.002 0-.004 0-.006.002-.767.245-1.488.583-2.14 1.002l-.658.423c-.322.207-.665.378-1.025.508l-.29.105-2.227.807a.25.25 0 0 0-.06.158l.555.901 3.12 1.013c.245.08.47.218.65.4l2.854 2.853c.182.18.32.404.4.65l1.012 3.12.901.554a.25.25 0 0 0 .158-.06l.807-2.228.105-.29c.13-.36.301-.703.508-1.024l.423-.659a7.258 7.258 0 0 0 1.002-2.14.006.006 0 0 0 .002-.006v-.186a.25.25 0 0 0-.25-.25h-.186a7.257 7.257 0 0 0-2.14 1.002l-.659.423a5.532 5.532 0 0 1-1.024.508l-.29.105-1.743.633a.75.75 0 0 1-.502-1.414l1.743-.633c.373-.135.732-.303 1.071-.503l.66-.423a8.756 8.756 0 0 1 2.502-1.115l.053-.01V1.75a1.75 1.75 0 0 0-1.75-1.75h-.186c-.529.09-1.036.257-1.507.495l-.013.007.017-.052Z"></path>`,
            'star': `<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>`,
            'fork': `<path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>`,
            'trophy': `<path d="M3.75 2h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm-2 3.5a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H1.75ZM6 10.372a5.228 5.228 0 0 1-2.341-3.693 2.015 2.015 0 0 1 1.054-2.28 2.012 2.012 0 0 1 2.1.28c.189.15.426.222.662.222.238 0 .474-.073.663-.223a2.015 2.015 0 0 1 2.102-.278 2.015 2.015 0 0 1 1.052 2.28A5.226 5.226 0 0 1 8 10.372v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5A2.25 2.25 0 0 1 2 11.25v-.878Zm2-1.9a3.733 3.733 0 0 0 2.204-1.637.514.514 0 0 0-.253-.75.516.516 0 0 0-.585.12c-.225.18-.558.195-.805.006-.497-.38-1.127-.38-1.624 0-.247.19-.58.174-.805-.006a.516.516 0 0 0-.586-.12.514.514 0 0 0-.253.75A3.727 3.727 0 0 0 6 8.472v2.778a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V8.472Z"></path>`,
            'search': `<path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 6a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0Z"></path>`,
            'gift': `<path d="M2 5.5a3.5 3.5 0 0 1 3.5-3.5h5a3.5 3.5 0 0 1 3.5 3.5v9.75A1.75 1.75 0 0 1 12.25 17H5.5A3.5 3.5 0 0 1 2 13.5V5.5Zm3.5-2A2 2 0 0 0 3.5 5.5v8A2 2 0 0 0 5.5 15.5h6.75a.25.25 0 0 0 .25-.25v-9.75a2 2 0 0 0-2-2h-5Zm6.75 0h-4.5a3.5 3.5 0 0 1 3.5 3.5v1.25c0 .138.112.25.25.25h2a.25.25 0 0 0 .25-.25v-1.25a3.5 3.5 0 0 1-1.5-3.5ZM13 7h-1.5V5.5a2 2 0 0 0-2-2h1.5a2 2 0 0 1 2 2V7Z"></path>`,
            'checklist': `<path d="M3.5 3.75a.25.25 0 0 1 .25-.25h10.5a.25.25 0 0 1 .25.25v10.5a.25.25 0 0 1-.25.25H3.75a.25.25 0 0 1-.25-.25V3.75ZM3.75 2A1.75 1.75 0 0 0 2 3.75v10.5c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0 0 16 14.25V3.75C16 2.784 15.216 2 14.25 2H3.75Zm6.02 5.462L8 9.227 6.23 7.462a.75.75 0 0 0-1.06 1.06l2.3 2.3a.75.75 0 0 0 1.06 0l2.3-2.3a.75.75 0 0 0-1.06-1.06Z"></path>`,
            'globe': `<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8.75a9.64 9.64 0 0 0 1.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0 0 10.22 8.75Zm4.44-1.5a9.64 9.64 0 0 0-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 0 0-.857 1.215A9.64 9.64 0 0 0 5.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 0 0 4.666 5.5c-.123-.181-.24-.365-.352-.552-.715-1.192-1.203-2.63-1.418-4.948Zm-1.418-1.5h2.735c.214-2.317.703-3.756 1.418-4.949.11-.186.228-.37.352-.551a6.507 6.507 0 0 0-4.666 5.5Zm10.284 1.5h-2.734c-.214 2.317-.703 3.756-1.418 4.949-.11.186-.228.37-.352.551a6.507 6.507 0 0 0 4.666-5.5Zm-1.418-1.5c-.215-2.318-.703-3.757-1.418-4.949-.11-.186-.227-.37-.352-.551a6.507 6.507 0 0 0 4.666 5.5ZM8 1.5a6.5 6.5 0 0 0-6.5 6.5 6.5 6.5 0 0 0 6.5 6.5 6.5 6.5 0 0 0 6.5-6.5A6.5 6.5 0 0 0 8 1.5Z"></path>`,
            'book': `<path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25Z"></path>`,
            'share': {
                viewBox: '0 0 24 24',
                content: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.75 6C15.75 3.92893 14.0711 2.25 12 2.25C9.92893 2.25 8.25 3.92893 8.25 6C8.25 8.07107 9.92893 9.75 12 9.75C14.0711 9.75 15.75 8.07107 15.75 6ZM12 3.75C13.2426 3.75 14.25 4.75736 14.25 6C14.25 7.24264 13.2426 8.25 12 8.25C10.7574 8.25 9.75 7.24264 9.75 6C9.75 4.75736 10.7574 3.75 12 3.75Z" fill="currentColor"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.25 18C9.25 15.9289 7.57107 14.25 5.5 14.25C3.42893 14.25 1.75 15.9289 1.75 18C1.75 20.0711 3.42893 21.75 5.5 21.75C7.57107 21.75 9.25 20.0711 9.25 18ZM5.5 15.75C6.74264 15.75 7.75 16.7574 7.75 18C7.75 19.2426 6.74264 20.25 5.5 20.25C4.25736 20.25 3.25 19.2426 3.25 18C3.25 16.7574 4.25736 15.75 5.5 15.75Z" fill="currentColor"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5 14.25C20.5711 14.25 22.25 15.9289 22.25 18C22.25 20.0711 20.5711 21.75 18.5 21.75C16.4289 21.75 14.75 20.0711 14.75 18C14.75 15.9289 16.4289 14.25 18.5 14.25ZM20.75 18C20.75 16.7574 19.7426 15.75 18.5 15.75C17.2574 15.75 16.25 16.7574 16.25 18C16.25 19.2426 17.2574 20.25 18.5 20.25C19.7426 20.25 20.75 19.2426 20.75 18Z" fill="currentColor"></path> <path d="M7.20468 7.56231C7.51523 7.28821 7.54478 6.81426 7.27069 6.5037C6.99659 6.19315 6.52264 6.1636 6.21208 6.43769C4.39676 8.03991 3.25 10.3865 3.25 13C3.25 13.4142 3.58579 13.75 4 13.75C4.41421 13.75 4.75 13.4142 4.75 13C4.75 10.8347 5.69828 8.89187 7.20468 7.56231Z" fill="currentColor"></path> <path d="M17.7879 6.43769C17.4774 6.1636 17.0034 6.19315 16.7293 6.5037C16.4552 6.81426 16.4848 7.28821 16.7953 7.56231C18.3017 8.89187 19.25 10.8347 19.25 13C19.25 13.4142 19.5858 13.75 20 13.75C20.4142 13.75 20.75 13.4142 20.75 13C20.75 10.3865 19.6032 8.03991 17.7879 6.43769Z" fill="currentColor"></path> <path d="M10.1869 20.0217C9.7858 19.9184 9.37692 20.1599 9.27367 20.561C9.17043 20.9622 9.41192 21.3711 9.81306 21.4743C10.5129 21.6544 11.2458 21.75 12 21.75C12.7542 21.75 13.4871 21.6544 14.1869 21.4743C14.5881 21.3711 14.8296 20.9622 14.7263 20.561C14.6231 20.1599 14.2142 19.9184 13.8131 20.0217C13.2344 20.1706 12.627 20.25 12 20.25C11.373 20.25 10.7656 20.1706 10.1869 20.0217Z" fill="currentColor"></path></g>`
            },
            'folder': {
                viewBox: '0 0 400 400',
                content: `<g transform="translate(0,-652.36216)"><path fill="currentColor" d="m 237.4297,701.86214 0,40 -186,0 0,49.6914 -51.4297,0 0,211.30866 400,0 0,-300.00006 0,-1 -137.5703,0 z m 25,25 112.5703,0 0,251 -50,0 0,-185.42 -0.1621,0 0,-0.8886 -248.4082,0 0,-24.6914 186,0.9453 z"></path></g>`
            },
            'yearInReview': {
                viewBox: '0 0 16 16',
                content: `<path fill="currentColor" fill-rule="evenodd" d="M8,0 C8.51283143,0 8.93550653,0.386039974 8.9932722,0.883378828 L9,1 L11,1 L11,2 L13,2 C13.51285,2 13.9355092,2.38604429 13.9932725,2.88337975 L14,3 L14,15 C14,15.51285 13.613973,15.9355092 13.1166239,15.9932725 L13,16 L3,16 C2.48716857,16 2.06449347,15.613973 2.0067278,15.1166239 L2,15 L2,3 C2,2.48716857 2.38604429,2.06449347 2.88337975,2.0067278 L3,2 L5,2 L5,1 L7,1 C7,0.447715 7.44772,0 8,0 Z M5,4 L4,4 L4,14 L12,14 L12,4 L11,4 L11,5 L5,5 L5,4 Z M10.5352,7.29289 C10.9258,7.68342 10.9258,8.31658 10.5352,8.70711 L7.70711,11.5352 C7.31658,11.9258 6.68342,11.9258 6.29289,11.5352 L5.29289,10.5352 C4.90237,10.1447 4.90237,9.51154 5.29289,9.12102 C5.68342,8.73049 6.31658,8.73049 6.70711,9.12102 L7,9.41391 L9.12102,7.29289 C9.51154,6.90237 10.1447,6.90237 10.5352,7.29289 Z M8,2 C7.44772,2 7,2.44772 7,3 C7,3.55228 7.44772,4 8,4 C8.55228,4 9,3.55228 9,3 C9,2.44772 8.55228,2 8,2 Z"></path>`
            },
            'insights': {
                viewBox: '0 0 24 24',
                content: `<path d="M11 6C13.7614 6 16 8.23858 16 11M16.6588 16.6549L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>`
            },
            'achievement': {
                viewBox: '0 0 512 512',
                content: `<g><polygon fill="currentColor" points="239.266,387.893 212.245,371.584 212.245,512 299.755,512 299.755,364.066 289.468,358.608 "></polygon><polygon fill="currentColor" points="316.489,512 403.991,512 403.991,419.375 316.489,372.948 "></polygon><polygon fill="currentColor" points="420.725,428.257 420.725,512 494.459,512 494.459,467.379 "></polygon><polygon fill="currentColor" points="108.009,512 195.511,512 195.511,361.476 108.009,308.643 "></polygon><polygon fill="currentColor" points="17.541,512 91.275,512 91.275,298.536 17.541,254.021 "></polygon><path fill="currentColor" d="M228.325,77.514c21.358-1.986,37.071-20.918,35.077-42.276c-1.977-21.343-20.901-37.048-42.267-35.07 c-21.343,1.978-37.055,20.902-35.07,42.268C188.043,63.787,206.959,79.491,228.325,77.514z"></path><path fill="currentColor" d="M359.999,310.898l-18.548-61.044c-0.76,1.324-1.528,2.648-2.402,3.906 c-8.49,12.208-21.841,20.003-36.646,21.368l-6.824,0.465l19.448,47.162c4.126,6.831,9.224,13.025,15.14,18.393l50.57,45.92 c7.133,6.202,17.919,5.614,24.349-1.332l0.458-0.474c6.406-6.928,6.177-17.681-0.498-24.333L359.999,310.898z"></path><polygon fill="currentColor" points="231.324,123.336 244.266,128.532 248.107,114.38 240.115,100.777 224.861,112.314 "></polygon><path fill="currentColor" d="M225.996,350.601l0.687-0.164c9.168-2.272,14.977-11.275,13.253-20.541l-11.137-59.762l73.456-5.099 c10.541-0.736,20.199-6.21,26.229-14.888c6.038-8.694,7.795-19.643,4.813-29.79l-2.762-9.356l-22.968-83.662l39.375,2.124 l31.474,30.322c-1.52,1.855-2.28,4.282-1.667,6.798l2.574,10.418l-18.303,4.519c-4.33,1.054-6.97,5.434-5.899,9.764l12.321,49.998 c1.078,4.339,5.45,6.978,9.773,5.924l77.656-19.152c4.339-1.079,6.978-5.459,5.908-9.797l-12.33-49.989 c-1.062-4.322-5.442-6.978-9.772-5.924l-18.303,4.518l-2.566-10.402c-1.046-4.224-5.319-6.806-9.552-5.768l-1.912,0.474 c-0.433-1.773-1.218-3.489-2.394-5.025l-30.788-40.372c-3.317-4.347-8.048-7.41-13.367-8.645l-50.636-18.123 c-17.134-6.128-36.05-3.554-50.986,6.618l-4.388,62.311l-40.332-28.238l-28.148,21.596l-45.553-16.44 c-7.141-3.162-15.484-0.122-18.899,6.888l-0.474,0.964c-1.683,3.481-1.929,7.476-0.654,11.112c1.266,3.652,3.947,6.635,7.443,8.318 l54.908,26.212c6.831,3.268,14.781,3.236,21.588-0.082l29.276-19.471l20.084,57.588l-48.592,4.257 c-8.178,0.743-15.623,5.098-20.256,11.88c-4.624,6.781-5.973,15.287-3.685,23.189l24.153,82.598 C207.326,347.471,216.731,352.88,225.996,350.601z M410.078,158.062l0.368,0.212l2.566,10.41l-26.318,6.495l-2.492-10.09 c4.886,4.004,11.864,4.306,16.939,0.384l0.294-0.221c2.124-1.643,3.612-3.8,4.461-6.152L410.078,158.062z M275.169,198.076 c0.245,2.656-1.692,4.976-4.339,5.237c-2.639,0.229-4.976-1.7-5.237-4.347c-0.238-2.656,1.7-4.992,4.355-5.229 C272.578,193.491,274.924,195.42,275.169,198.076z M262.357,167.41c2.631-0.245,4.976,1.684,5.222,4.331 c0.245,2.656-1.7,5.001-4.339,5.238c-2.639,0.237-4.984-1.692-5.221-4.339C257.765,169.992,259.709,167.655,262.357,167.41z"></path></g>`
            },
            'pattern': {
                viewBox: '0 0 24 24',
                content: `<g fill="none"><circle cx="3.41" cy="3.41" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="12" cy="3.41" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="20.59" cy="3.41" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="3.41" cy="12" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="12" cy="12" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="20.59" cy="12" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="3.41" cy="20.59" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="12" cy="20.59" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="20.59" cy="20.59" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><line x1="10.65" y1="10.65" x2="4.76" y2="4.76" stroke="currentColor" stroke-width="1.91"></line><line x1="12" y1="18.68" x2="12" y2="13.91" stroke="currentColor" stroke-width="1.91"></line><line x1="18.68" y1="3.41" x2="13.91" y2="3.41" stroke="currentColor" stroke-width="1.91"></line><line x1="10.09" y1="3.41" x2="5.32" y2="3.41" stroke="currentColor" stroke-width="1.91"></line></g>`
            },
            'funFact': {
                viewBox: '0 0 24 24',
                content: `<path fill-rule="evenodd" clip-rule="evenodd" d="M3.4 4h17.2A2.4 2.4 0 0 1 23 6.4v11.2a2.4 2.4 0 0 1-2.4 2.4H3.4A2.4 2.4 0 0 1 1 17.6V6.4A2.4 2.4 0 0 1 3.4 4ZM4 9a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm1 2a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H5Zm0 3a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H5Zm10.707.707 4-4a1 1 0 0 0-1.414-1.414L15 12.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0Z" fill="currentColor"></path>`
            }

        };

        const iconDef = icons[name] || icons['graph'];
        const viewBox = iconDef.viewBox || "0 0 16 16";
        const content = iconDef.content || iconDef;

        return `<svg viewBox="${viewBox}" width="${size}" height="${size}" fill="currentColor" style="display: inline-block; vertical-align: text-bottom;">${content}</svg>`;
    }

    static generateAllSlides(data, insights, summary) {
        const slides = [
            this.createWelcomeSlide(data),
            this.createContributionsSlide(data),
            this.createLanguagesSlide(data),
            this.createProductivitySlide(data),
            this.createBiggestProjectSlide(data),
            this.createInsightsSlide(insights),
            this.createSummarySlide(data, summary, insights),
            this.createShareSlide(data)
        ];

        return slides.join('');
    }

    // Slide 1: Welcome
    static createWelcomeSlide(data) {
        return `
            <div class="slide active" data-slide="0">
                <div class="slide-content">
                    <div class="welcome-avatar">
                        <img src="${data.profile.avatar}" alt="${data.profile.name}" class="avatar-image">
                        <div class="avatar-ring"></div>
                    </div>
                    <h1 class="slide-title gradient-text">${data.profile.name}</h1>
                    <p class="slide-subtitle">Your ${data.year} GitHub Wrapped</p>
                    <div class="welcome-stats">
                        <div class="welcome-stat">
                            <div class="stat-value">${data.commits.total}</div>
                            <div class="stat-label">Commits</div>
                        </div>
                        <div class="welcome-stat">
                            <div class="stat-value">${data.repoCount}</div>
                            <div class="stat-label">Repositories</div>
                        </div>
                        <div class="welcome-stat">
                            <div class="stat-value">${data.totalStars}</div>
                            <div class="stat-label">Stars</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Slide 2: Total Contributions
    static createContributionsSlide(data) {
        const avgPerDay = (data.commits.total / 365).toFixed(1);
        const mostActiveMonth = this.getMostActiveMonth(data.commits.byMonth);

        return `
            <div class="slide" data-slide="1">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('graph', 80)}</div>
                    <h2 class="slide-title">Your Contribution Story</h2>
                    <div class="big-number gradient-text" id="commit-counter">0</div>
                    <p class="slide-subtitle">commits in ${data.year}</p>
                    <div class="contribution-details">
                        <div class="detail-item">
                            <span class="detail-icon" style="width: 24px">${this.getIcon('calendar', 24)}</span>
                            <span class="detail-text">${avgPerDay} commits per day</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon" style="width: 24px">${this.getIcon('flame', 24)}</span>
                            <span class="detail-text">Most active in ${mostActiveMonth}</span>
                        </div>
                    </div>
                    <div id="contribution-heatmap" class="chart-container"></div>
                </div>
            </div>
        `;
    }

    // Slide 3: Top Languages
    static createLanguagesSlide(data) {
        const topLang = data.languages[0]?.name || 'Code';
        const langCount = data.languages.length;

        return `
            <div class="slide" data-slide="2">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('code', 80)}</div>
                    <h2 class="slide-title">Your Language Mix</h2>
                    <p class="slide-subtitle">You coded in ${langCount} different languages</p>
                    <div class="top-language">
                        <div class="top-lang-label">Top Language</div>
                        <div class="top-lang-name gradient-text">${topLang}</div>
                        <div class="top-lang-percentage">${data.languages[0]?.percentage || 0}%</div>
                    </div>
                    <div id="language-chart" class="chart-container"></div>
                </div>
            </div>
        `;
    }

    // Slide 4: Most Productive Time
    static createProductivitySlide(data) {
        const { day, hour, timeOfDay } = data.productiveTime;
        // Use proper clock icon instead of generic emoji
        const icon = this.getIcon('clock', 80);

        return `
            <div class="slide" data-slide="3">
                <div class="slide-content">
                    <div class="slide-icon">${icon}</div>
                    <h2 class="slide-title">Your Peak Coding Time</h2>
                    <div class="productivity-info">
                        <div class="productivity-day-title gradient-text">${day}s</div>
                        <div class="productivity-time">at ${hour}:00 (${timeOfDay})</div>
                    </div>
                    <p class="slide-subtitle">When the magic happens ✨</p>
                    <div id="productivity-chart" class="chart-container"></div>
                </div>
            </div>
        `;
    }

    // Slide 5: Biggest Project
    static createBiggestProjectSlide(data) {
        const project = data.biggestProject;

        if (!project) {
            return `
                <div class="slide" data-slide="4">
                    <div class="slide-content">
                        <div class="slide-icon">${this.getIcon('folder', 80)}</div>
                        <h2 class="slide-title">Your Projects</h2>
                        <p class="slide-subtitle">You worked on ${data.repoCount} repositories this year!</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="slide" data-slide="4">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('folder', 80)}</div>
                    <h2 class="slide-title">Your Biggest Project</h2>
                    <div class="project-card">
                        <h3 class="project-name gradient-text">${project.name}</h3>
                        ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
                        <div class="project-stats">
                            <div class="project-stat">
                                <span class="stat-icon">${this.getIcon('star', 20)}</span>
                                <span class="stat-value">${project.stars}</span>
                                <span class="stat-label">Stars</span>
                            </div>
                            <div class="project-stat">
                                <span class="stat-icon">${this.getIcon('fork', 20)}</span>
                                <span class="stat-value">${project.forks}</span>
                                <span class="stat-label">Forks</span>
                            </div>
                            ${project.language ? `
                            <div class="project-stat">
                                <span class="stat-icon">${this.getIcon('code', 20)}</span>
                                <span class="stat-value">${project.language}</span>
                                <span class="stat-label">Language</span>
                            </div>
                            ` : ''}
                        </div>
                        <a href="${project.url}" target="_blank" class="project-link">View on GitHub →</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Slide 6: AI Insights
    static createInsightsSlide(insights) {
        return `
            <div class="slide" data-slide="5">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('insights', 80)}</div>
                    <h2 class="slide-title">AI-Powered Insights</h2>
                    <p class="slide-subtitle">What your code says about you</p>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <div class="insight-icon">${this.getIcon('achievement', 32)}</div>
                            <div class="insight-title">Achievement</div>
                            <div class="insight-text">${insights.achievement}</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">${this.getIcon('pattern', 32)}</div>
                            <div class="insight-title">Pattern</div>
                            <div class="insight-text">${insights.pattern}</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">${this.getIcon('graph', 32)}</div>
                            <div class="insight-title">Growth</div>
                            <div class="insight-text">${insights.growth}</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">${this.getIcon('funFact', 32)}</div>
                            <div class="insight-title">Fun Fact</div>
                            <div class="insight-text">${insights.funFact}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Slide 7: Year Summary
    static createSummarySlide(data, summary, insights) {
        return `
            <div class="slide" data-slide="6">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('yearInReview', 80)}</div>
                    <h2 class="slide-title">${data.year} in Review</h2>
                    <div class="summary-text">${summary}</div>
                    <div class="summary-highlights">
                        <div class="highlight-item">
                            <div class="highlight-value gradient-text">${data.commits.total}</div>
                            <div class="highlight-label">Total Commits</div>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-value gradient-text">${data.languages.length}</div>
                            <div class="highlight-label">Languages Used</div>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-value gradient-text">${data.repoCount}</div>
                            <div class="highlight-label">Repositories</div>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-value gradient-text">${data.totalStars}</div>
                            <div class="highlight-label">Stars Earned</div>
                        </div>
                    </div>
                    <div class="motivation-message">
                        <p>${insights.motivation}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Slide 8: Share
    static createShareSlide(data) {
        return `
            <div class="slide" data-slide="7">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('share', 80)}</div>
                    <h2 class="slide-title">Share Your Wrapped!</h2>
                    <p class="slide-subtitle">Show the world your coding journey</p>
                    <div class="share-preview">
                        <div class="share-card">
                            <div class="share-header">
                                <img src="${data.profile.avatar}" alt="${data.profile.name}" class="share-avatar">
                                <div class="share-info">
                                    <div class="share-name">${data.profile.name}</div>
                                    <div class="share-year">GitHub Wrapped ${data.year}</div>
                                </div>
                            </div>
                            <div class="share-stats">
                                <div class="share-stat">
                                    <div class="share-stat-value">${data.commits.total}</div>
                                    <div class="share-stat-label">Commits</div>
                                </div>
                                <div class="share-stat">
                                    <div class="share-stat-value">${data.languages[0]?.name || 'Code'}</div>
                                    <div class="share-stat-label">Top Language</div>
                                </div>
                                <div class="share-stat">
                                    <div class="share-stat-value">${data.totalStars}</div>
                                    <div class="share-stat-label">Stars</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="share-actions">
                        <button class="share-action-btn twitter-btn">
                            <span>Share on Twitter</span>
                        </button>
                        <button class="share-action-btn linkedin-btn">
                            <span>Share on LinkedIn</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper: Get most active month
    static getMostActiveMonth(byMonth) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const maxIndex = byMonth.indexOf(Math.max(...byMonth));
        return months[maxIndex];
    }

    // Helper: Get time emoji
    static getTimeEmoji(timeOfDay) {
        // Keep emojis for text description if needed, but we use icon for main slide
        const emojis = {
            'Morning': '🌅',
            'Afternoon': '☀️',
            'Evening': '🌆',
            'Night': '🌙'
        };
        return emojis[timeOfDay] || '⏰';
    }
}

// Export for use in other modules
window.Slides = Slides;
