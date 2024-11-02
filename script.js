// script.js
class CountyMap {
    constructor() {
        this.selectedColor = '';
        this.mapData = null;
        this.countyData = {};
        this.playerColors = [
            { color: '#FF0000', name: 'Red' },
            { color: '#0000FF', name: 'Blue' },
            { color: '#00FF00', name: 'Green' },
            { color: '#FFD700', name: 'Gold' },
            { color: '#800080', name: 'Purple' }
        ];
        this.playerStats = {};
        this.socket = null;
        this.activityLog = [];
        this.isConnecting = false;
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.isPanning = false;
        this.lastPoint = { x: 0, y: 0 };
        this.undoStack = [];
        this.redoStack = [];

        this.connecticutCounties = {
            // Map all possible variations to the standardized name
            'New Haven': 'New Haven County, Connecticut',
            'New Haven County': 'New Haven County, Connecticut',
            'New Haven, CT': 'New Haven County, Connecticut',
            'New Haven County, CT': 'New Haven County, Connecticut',
            
            'Hartford': 'Hartford County, Connecticut',
            'Hartford County': 'Hartford County, Connecticut',
            'Hartford, CT': 'Hartford County, Connecticut',
            'Hartford County, CT': 'Hartford County, Connecticut',
            
            'Fairfield': 'Fairfield County, Connecticut',
            'Fairfield County': 'Fairfield County, Connecticut',
            'Fairfield, CT': 'Fairfield County, Connecticut',
            'Fairfield County, CT': 'Fairfield County, Connecticut',
            
            'Litchfield': 'Litchfield County, Connecticut',
            'Litchfield County': 'Litchfield County, Connecticut',
            'Litchfield, CT': 'Litchfield County, Connecticut',
            'Litchfield County, CT': 'Litchfield County, Connecticut',
            
            'Middlesex': 'Middlesex County, Connecticut',
            'Middlesex County': 'Middlesex County, Connecticut',
            'Middlesex, CT': 'Middlesex County, Connecticut',
            'Middlesex County, CT': 'Middlesex County, Connecticut',
            
            'New London': 'New London County, Connecticut',
            'New London County': 'New London County, Connecticut',
            'New London, CT': 'New London County, Connecticut',
            'New London County, CT': 'New London County, Connecticut',
            
            'Tolland': 'Tolland County, Connecticut',
            'Tolland County': 'Tolland County, Connecticut',
            'Tolland, CT': 'Tolland County, Connecticut',
            'Tolland County, CT': 'Tolland County, Connecticut',
            
            'Windham': 'Windham County, Connecticut',
            'Windham County': 'Windham County, Connecticut',
            'Windham, CT': 'Windham County, Connecticut',
            'Windham County, CT': 'Windham County, Connecticut'
        };

        // Special cases mapping for problematic counties/cities
        this.specialCases = {
            'VA': {
                'Bedford City': 'Bedford County',
                'Franklin City': 'Franklin County',
                'Richmond City': 'Richmond city',
                'Roanoke City': 'Roanoke city',
                'Newport News City': 'Newport News city',
                'Norfolk City': 'Norfolk city',
                'Virginia Beach City': 'Virginia Beach city',
                'Alexandria City': 'Alexandria city',
                'Bristol City': 'Bristol city',
                'Buena Vista City': 'Buena Vista city',
                'Charlottesville City': 'Charlottesville city',
                'Colonial Heights City': 'Colonial Heights city',
                'Covington City': 'Covington city',
                'Danville City': 'Danville city',
                'Emporia City': 'Emporia city',
                'Fairfax City': 'Fairfax city',
                'Falls Church City': 'Falls Church city',
                'Franklin City': 'Franklin city',
                'Fredericksburg City': 'Fredericksburg city',
                'Galax City': 'Galax city',
                'Hampton City': 'Hampton city',
                'Harrisonburg City': 'Harrisonburg city',
                'Hopewell City': 'Hopewell city',
                'Lexington City': 'Lexington city',
                'Lynchburg City': 'Lynchburg city',
                'Manassas City': 'Manassas city',
                'Manassas Park City': 'Manassas Park city',
                'Martinsville City': 'Martinsville city',
                'Norton City': 'Norton city',
                'Petersburg City': 'Petersburg city',
                'Poquoson City': 'Poquoson city',
                'Portsmouth City': 'Portsmouth city',
                'Radford City': 'Radford city',
                'Salem City': 'Salem city',
                'Staunton City': 'Staunton city',
                'Suffolk City': 'Suffolk city',
                'Waynesboro City': 'Waynesboro city',
                'Winchester City': 'Winchester city'
            },
            'AK': {
                'Aleutians East': 'Aleutians East Borough',
                'Aleutians West': 'Aleutians West Census Area',
                'Anchorage': 'Anchorage Municipality',
                'Bristol Bay': 'Bristol Bay Borough',
                'Denali': 'Denali Borough',
                'Fairbanks North Star': 'Fairbanks North Star Borough',
                'Haines': 'Haines Borough',
                'Juneau': 'Juneau City and Borough',
                'Kenai Peninsula': 'Kenai Peninsula Borough',
                'Ketchikan Gateway': 'Ketchikan Gateway Borough',
                'Kodiak Island': 'Kodiak Island Borough',
                'Lake and Peninsula': 'Lake and Peninsula Borough',
                'Matanuska-Susitna': 'Matanuska-Susitna Borough',
                'North Slope': 'North Slope Borough',
                'Northwest Arctic': 'Northwest Arctic Borough',
                'Petersburg': 'Petersburg Borough',
                'Sitka': 'Sitka City and Borough',
                'Skagway': 'Skagway Municipality',
                'Wrangell': 'Wrangell City and Borough',
                'Yakutat': 'Yakutat City and Borough',
                'Bethel': 'Bethel Census Area',
                'Copper River': 'Copper River Census Area',
                'Dillingham': 'Dillingham Census Area',
                'Hoonah-Angoon': 'Hoonah-Angoon Census Area',
                'Kusilvak': 'Kusilvak Census Area',
                'Nome': 'Nome Census Area',
                'Prince of Wales-Hyder': 'Prince of Wales-Hyder Census Area',
                'Southeast Fairbanks': 'Southeast Fairbanks Census Area',
                'Yukon-Koyukuk': 'Yukon-Koyukuk Census Area'
            }
        };

        this.stateMapping = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona',
            'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado',
            'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida',
            'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
            'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
            'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana',
            'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts',
            'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
            'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska',
            'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
            'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina',
            'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
            'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
            'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee',
            'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
            'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
            'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
        };

        this.playerColors.forEach(({color, name}) => {
            this.playerStats[color] = {
                name: name,
                totalPopulation: 0,
                totalLandArea: 0,
                countiesPainted: 0
            };
        });

        this.init();
    }
    async init() {
        try {
            await Promise.all([
                this.loadMapData(),
                this.loadCountyData()
            ]);
            this.initializeWebSocket();
            this.setupEventListeners();
            this.createPlayerStatsDisplay();
            this.setupZoomControls();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    debugConnecticutCounty(name) {
        console.log('Connecticut County Debug:', {
            originalName: name,
            normalized: this.normalizeCountyName(name),
            inMapping: !!this.connecticutCounties[name],
            possibleMatches: Object.keys(this.connecticutCounties)
                .filter(k => k.toLowerCase().includes(name.split(',')[0].toLowerCase()))
        });
    }

    normalizeCountyName(name) {
        if (!name) return '';
        
        // Remove quotes, periods, and extra spaces
        let normalized = name.replace(/[".]/g, '').trim();
        
        // Special handling for Connecticut
        if (normalized.includes('CT') || normalized.includes('Connecticut')) {
            // Try exact match first
            if (this.connecticutCounties[normalized]) {
                return this.connecticutCounties[normalized];
            }
            
            // Try without state
            const withoutState = normalized.split(',')[0].trim();
            if (this.connecticutCounties[withoutState]) {
                return this.connecticutCounties[withoutState];
            }
            
            // Try with "County" if not present
            if (!withoutState.includes('County')) {
                const withCounty = withoutState + ' County';
                if (this.connecticutCounties[withCounty]) {
                    return this.connecticutCounties[withCounty];
                }
            }
        }
        
        let parts = normalized.split(',').map(part => part.trim());
        if (parts.length === 2) {
            let [region, state] = parts;
            state = state.trim();
            
            const fullState = this.stateMapping[state] || state;
            
            if (state === 'AK' || state === 'Alaska') {
                if (this.specialCases['AK'][region]) {
                    region = this.specialCases['AK'][region];
                } else {
                    if (region.includes('Borough')) {
                        region = region.replace(/\s*Borough\s*$/i, ' Borough');
                    } else if (region.includes('Municipality')) {
                        region = region.replace(/\s*Municipality\s*$/i, ' Municipality');
                    } else if (region.includes('Census Area')) {
                        region = region.replace(/\s*Census Area\s*$/i, ' Census Area');
                    } else if (region.includes('City and Borough')) {
                        region = region.replace(/\s*City and Borough\s*$/i, ' City and Borough');
                    }
                }
            } else if (state === 'VA' || state === 'Virginia') {
                const isCity = region.toLowerCase().includes('city');
                if (isCity) {
                    const baseRegion = region.replace(/\s*city\s*$/i, '').trim();
                    if (this.specialCases['VA'][baseRegion + ' City']) {
                        region = this.specialCases['VA'][baseRegion + ' City'];
                    } else {
                        region = `${baseRegion} city`;
                    }
                } else if (!region.toLowerCase().includes('county')) {
                    region += ' County';
                }
            } else if (state === 'LA' || state === 'Louisiana') {
                if (!region.toLowerCase().includes('parish')) {
                    region += ' Parish';
                }
            } else if (!region.toLowerCase().includes('county')) {
                region += ' County';
            }
            
            normalized = `${region}, ${fullState}`;
        }
        
        return normalized;
    }

    async loadMapData() {
        try {
            const response = await fetch('your-county-map.svg');
            if (!response.ok) throw new Error('Failed to fetch SVG');
            
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            
            if (svgDoc.querySelector('parsererror')) {
                throw new Error('SVG parsing failed');
            }
            
            const svg = svgDoc.querySelector('svg');
            if (!svg.hasAttribute('viewBox')) {
                const width = svg.getAttribute('width');
                const height = svg.getAttribute('height');
                svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            }
            
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            
            const countyPaths = svgDoc.querySelectorAll('path');
            let matchedCount = 0;
            
            countyPaths.forEach(county => {
                county.classList.add('county');
                
                const titleEl = county.querySelector('title');
                if (titleEl) {
                    const originalName = titleEl.textContent.trim();
                    const normalizedName = this.normalizeCountyName(originalName);
                    county.setAttribute('data-county', normalizedName);
                    county.setAttribute('data-original-name', originalName);
                    
                    // Debug Connecticut counties
                    if (originalName.includes('CT') || originalName.includes('Connecticut')) {
                        this.debugConnecticutCounty(originalName);
                    }

                    if (this.countyData[normalizedName]) {
                        matchedCount++;
                    } else {
                        console.log('Unmatched county:', {
                            original: originalName,
                            normalized: normalizedName
                        });
                    }
                }
            });
            
            const mapWrapper = document.getElementById('mapWrapper');
            mapWrapper.innerHTML = svg.outerHTML;
            this.attachCountyEventListeners();
            
            console.log(`Matched ${matchedCount} out of ${countyPaths.length} counties`);
            
        } catch (error) {
            console.error('Error loading map:', error);
            throw new Error('Failed to load county map');
        }
    }
    async loadCountyData() {
        try {
            const response = await fetch('data.csv');
            if (!response.ok) throw new Error('Failed to fetch CSV');
            
            const csvText = await response.text();
            const rawData = this.parseCSV(csvText);
            
            this.countyData = {};
            Object.entries(rawData).forEach(([originalName, data]) => {
                const normalizedName = this.normalizeCountyName(originalName);
                this.countyData[normalizedName] = {
                    ...data,
                    originalName
                };
                // Debug log for Connecticut counties
                if (originalName.includes('CT') || originalName.includes('Connecticut')) {
                    console.log('CSV County Data:', {
                        original: originalName,
                        normalized: normalizedName,
                        data: data
                    });
                }
            });
            
        } catch (error) {
            console.error('Error loading county data:', error);
            throw new Error('Failed to load county data');
        }
    }

    parseCSV(csvText) {
        const data = {};
        const lines = csvText.split('\n');
        
        lines.forEach((line, index) => {
            if (!line.trim()) return;
            
            try {
                const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                if (!parts || parts.length < 5) {
                    console.log(`Skipping invalid line ${index}:`, line);
                    return;
                }
                
                const countyName = parts[0].replace(/[".]/g, '').trim();
                const population = parseInt(parts[1].replace(/[",]/g, ''));
                const landArea = parseFloat(parts[2]);
                const waterArea = parseFloat(parts[3]);
                const totalArea = parseFloat(parts[4]);

                data[countyName] = {
                    population,
                    landArea,
                    waterArea,
                    totalArea
                };
                
            } catch (err) {
                console.warn(`Failed to parse line ${index}:`, line);
            }
        });
        
        return data;
    }

    initializeWebSocket() {
        if (this.isConnecting) return;
        this.isConnecting = true;
        
        try {
            this.socket = new WebSocket('ws://localhost:8080/ws');
            
            this.socket.onopen = () => {
                this.isConnecting = false;
                this.socket.send(JSON.stringify({ type: 'requestState' }));
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            };
            
            this.socket.onclose = () => {
                this.isConnecting = false;
                setTimeout(() => this.initializeWebSocket(), 2000);
            };
            
            this.socket.onerror = () => {
                this.isConnecting = false;
            };
        } catch (error) {
            this.isConnecting = false;
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'gameState':
                this.applyGameState(data.counties);
                this.updatePlayerStats();
                break;
                
            case 'colorUpdate':
                const county = document.querySelector(`[data-county="${data.countyName}"]`);
                if (county) {
                    county.style.fill = data.color;
                    const originalName = county.getAttribute('data-original-name') || data.countyName;
                    this.addActivity(`${originalName} claimed by ${this.getColorName(data.color)}`);
                    this.updatePlayerStats();
                }
                break;
                
            case 'clearAll':
                document.querySelectorAll('.county').forEach(county => {
                    county.style.fill = '';
                });
                this.addActivity('Map cleared');
                this.updatePlayerStats();
                break;
                
            case 'userCount':
                this.updateUserCount(data.count);
                break;
        }
    }

    setupEventListeners() {
        const colorPicker = document.querySelector('.color-picker');
        colorPicker.innerHTML = '';
        
        this.playerColors.forEach(({color, name}) => {
            const button = document.createElement('button');
            button.className = 'color-btn';
            button.style.backgroundColor = color;
            button.dataset.color = color;
            button.title = name;
            button.addEventListener('click', () => this.selectColor(color));
            colorPicker.appendChild(button);
        });
        
        this.selectColor(this.playerColors[0].color);
        
        const clearBtn = document.getElementById('clearAll');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }

        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'edit-controls';
        controlsContainer.innerHTML = `
            <button id="undoBtn" class="edit-btn" disabled>Undo</button>
            <button id="redoBtn" class="edit-btn" disabled>Redo</button>
        `;

        const undoBtn = controlsContainer.querySelector('#undoBtn');
        const redoBtn = controlsContainer.querySelector('#redoBtn');
        
        undoBtn.addEventListener('click', () => this.undo());
        redoBtn.addEventListener('click', () => this.redo());

        const mapControls = document.querySelector('.controls');
        if (mapControls) {
            mapControls.appendChild(controlsContainer);
        }
    }
    createPlayerStatsDisplay() {
        const statsContainer = document.createElement('div');
        statsContainer.className = 'player-stats-container';
        statsContainer.innerHTML = `
            <h3>Player Statistics</h3>
            <div class="player-stats-grid">
                ${this.playerColors.map(({color, name}) => `
                    <div class="player-stat" style="border-left: 4px solid ${color}">
                        <h4>${name} Player</h4>
                        <div id="stats-${color.substring(1)}">
                            <p>Counties Painted: 0</p>
                            <p>Total Population: 0</p>
                            <p>Total Land Area: 0 sq mi</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        const mapWrapper = document.getElementById('mapWrapper');
        mapWrapper.parentNode.insertBefore(statsContainer, mapWrapper.nextSibling);
    }

    setupZoomControls() {
        const mapWrapper = document.getElementById('mapWrapper');
        
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        zoomControls.innerHTML = `
            <button class="zoom-btn" id="zoomIn">+</button>
            <button class="zoom-btn" id="zoomReset">R</button>
            <button class="zoom-btn" id="zoomOut">-</button>
        `;
        mapWrapper.appendChild(zoomControls);

        document.getElementById('zoomIn').addEventListener('click', () => this.handleZoom(0.1));
        document.getElementById('zoomOut').addEventListener('click', () => this.handleZoom(-0.1));
        document.getElementById('zoomReset').addEventListener('click', () => this.resetZoom());

        mapWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.handleZoom(delta);
        });

        mapWrapper.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isPanning = true;
                this.lastPoint = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.lastPoint.x;
                const dy = e.clientY - this.lastPoint.y;
                this.pan.x += dx;
                this.pan.y += dy;
                this.lastPoint = { x: e.clientX, y: e.clientY };
                this.updateMapTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            this.isPanning = false;
        });
    }

    attachCountyEventListeners() {
        document.querySelectorAll('.county').forEach(county => {
            county.addEventListener('click', (e) => this.handleCountyClick(e));
            county.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            county.addEventListener('mouseleave', () => this.hideTooltip());
            
            county.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleCountyClick(e.touches[0]);
            });
        });
    }

    handleCountyClick(event) {
        if (this.isPanning) return;
        
        const county = event.target.closest('path');
        if (!county || !county.classList.contains('county')) return;
        
        const countyId = county.getAttribute('data-county');
        const originalName = county.getAttribute('data-original-name');
        const previousColor = county.style.fill;

        console.log('County Click:', {
            normalizedName: countyId,
            originalName: originalName,
            data: this.countyData[countyId]
        });
        
        this.addToUndoStack({
            countyId: countyId,
            color: this.selectedColor,
            previousColor: previousColor
        });

        county.style.fill = this.selectedColor;
        
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'colorUpdate',
                countyId: countyId,
                countyName: originalName || countyId,
                color: this.selectedColor
            }));
        }
        
        this.addActivity(`${originalName || countyId} colored ${this.getColorName(this.selectedColor)}`);
        this.updatePlayerStats();
    }

    handleMouseMove(event) {
        const county = event.target;
        const normalizedName = county.getAttribute('data-county');
        const data = this.countyData[normalizedName];
        
        if (data) {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.display = 'block';
            tooltip.innerHTML = `
                <strong>${data.originalName || normalizedName}</strong><br>
                Population: ${data.population.toLocaleString()}<br>
                Land Area: ${data.landArea.toLocaleString()} sq mi<br>
                Water Area: ${data.waterArea.toLocaleString()} sq mi<br>
                Total Area: ${(data.landArea + data.waterArea).toLocaleString()} sq mi
            `;
            
            const tooltipRect = tooltip.getBoundingClientRect();
            let left = event.pageX + 10;
            let top = event.pageY + 10;
            
            if (left + tooltipRect.width > window.innerWidth) {
                left = event.pageX - tooltipRect.width - 10;
            }
            if (top + tooltipRect.height > window.innerHeight) {
                top = event.pageY - tooltipRect.height - 10;
            }
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        }
    }

    hideTooltip() {
        document.getElementById('tooltip').style.display = 'none';
    }

    handleZoom(delta) {
        const newZoom = this.zoom + delta;
        if (newZoom >= 0.5 && newZoom <= 4) {
            this.zoom = newZoom;
            this.updateMapTransform();
        }
    }

    resetZoom() {
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.updateMapTransform();
    }

    updateMapTransform() {
        const svg = document.querySelector('#mapWrapper svg g');
        if (svg) {
            svg.style.transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
        }
    }

    updateUserCount(count) {
        const userCountElement = document.getElementById('userCount');
        if (userCountElement) {
            userCountElement.textContent = `${count} user${count !== 1 ? 's' : ''} online`;
        }
    }

    selectColor(color) {
        this.selectedColor = color;
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
    }

    getColorName(color) {
        const playerColor = this.playerColors.find(pc => pc.color.toUpperCase() === color.toUpperCase());
        return playerColor ? playerColor.name : color;
    }

    applyGameState(counties) {
        if (!counties) return;
        
        document.querySelectorAll('.county').forEach(county => {
            const countyId = county.getAttribute('data-county');
            const countyData = counties[countyId];
            county.style.fill = countyData ? countyData.color : '';
        });
        
        this.updatePlayerStats();
    }

    addToUndoStack(action) {
        this.undoStack.push(action);
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.undoStack.length === 0) return;
        
        const action = this.undoStack.pop();
        this.redoStack.push({
            countyId: action.countyId,
            color: action.previousColor,
            previousColor: action.color
        });
        
        const county = document.querySelector(`[data-county="${action.countyId}"]`);
        if (county) {
            county.style.fill = action.previousColor || '';
            
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'colorUpdate',
                    countyId: action.countyId,
                    countyName: county.getAttribute('data-original-name') || action.countyId,
                    color: action.previousColor || ''
                }));
            }
        }
        
        this.updatePlayerStats();
        this.updateUndoRedoButtons();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        
        const action = this.redoStack.pop();
        this.undoStack.push({
            countyId: action.countyId,
            color: action.previousColor,
            previousColor: action.color
        });
        
        const county = document.querySelector(`[data-county="${action.countyId}"]`);
        if (county) {
            county.style.fill = action.color || '';
            
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'colorUpdate',
                    countyId: action.countyId,
                    countyName: county.getAttribute('data-original-name') || action.countyId,
                    color: action.color || ''
                }));
            }
        }
        
        this.updatePlayerStats();
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) undoBtn.disabled = this.undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }

    clearAll() {
        document.querySelectorAll('.county').forEach(county => {
            county.style.fill = '';
        });
        
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'clearAll'
            }));
        }
        
        this.addActivity('Map cleared');
        this.updatePlayerStats();
        this.undoStack = [];
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    addActivity(message) {
        const timestamp = new Date().toLocaleTimeString();
        const activity = `${timestamp} - ${message}`;
        
        this.activityLog.unshift(activity);
        this.activityLog = this.activityLog.slice(0, 5);
        
        const activityLog = document.getElementById('activityLog');
        if (activityLog) {
            activityLog.innerHTML = this.activityLog
                .map(activity => `<div class="activity-item">${activity}</div>`)
                .join('');
        }
    }

    updatePlayerStats() {
        this.playerColors.forEach(({color}) => {
            this.playerStats[color] = {
                totalPopulation: 0,
                totalLandArea: 0,
                countiesPainted: 0
            };
        });

        document.querySelectorAll('.county').forEach(county => {
            const fill = county.style.fill;
            if (!fill || fill === '') return;
            
            const normalizedName = county.getAttribute('data-county');
            const countyData = this.countyData[normalizedName];
            
            if (countyData) {
                const colorHex = this.convertRgbToHex(fill).toUpperCase();
                
                if (this.playerStats[colorHex]) {
                    this.playerStats[colorHex].countiesPainted++;
                    this.playerStats[colorHex].totalPopulation += countyData.population || 0;
                    this.playerStats[colorHex].totalLandArea += countyData.landArea || 0;
                }
            }
        });

        this.playerColors.forEach(({color}) => {
            const stats = this.playerStats[color];
            const statsElement = document.getElementById(`stats-${color.substring(1)}`);
            if (statsElement) {
                statsElement.innerHTML = `
                    <p>Counties Painted: ${stats.countiesPainted.toLocaleString()}</p>
                    <p>Total Population: ${stats.totalPopulation.toLocaleString()}</p>
                    <p>Total Land Area: ${stats.totalLandArea.toLocaleString()} sq mi</p>
                `;
            }
        });
    }

    convertRgbToHex(color) {
        if (color.startsWith('#')) {
            return color.toUpperCase();
        }
        
        const rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (rgb) {
            const hex = '#' + rgb.slice(1).map(n => {
                const hex = parseInt(n).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
            return hex.toUpperCase();
        }
        
        return color.toUpperCase();
    }

    showError(message) {
        console.error(message);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.countyMap = new CountyMap();
});
