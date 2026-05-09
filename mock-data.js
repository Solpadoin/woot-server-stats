/*
 * Local demo data for the public redesign.
 * The production server can still feed the original websocket/fastdl data.
 */
(function() {
	const daySeconds = 24 * 60 * 60;
	const nowSeconds = () => Math.floor(Date.now() / 1000);
	const dayNumber = () => Math.floor(Date.now() / 86400000);
	const makeId = (offset) => 76561198000000000n + BigInt(offset);

	const maps = [
		"stackdeathpb1",
		"sc_another",
		"darkstar",
		"sc_argentina_series",
		"shanghai",
		"swamp_ha",
		"sectore",
		"securityassault",
		"bridge2k",
		"gut_reaction",
		"warhouse",
		"sc_littleproblem",
		"sc_spacemonastery",
		"targetneutralized1",
		"frightmanor_hl"
	];

	const names = [
		"Foxpup",
		"w00tguy",
		"w00pie",
		"No Whining",
		"Marcu",
		"Wayne",
		"glitch31415",
		"Solpadoin",
		"CumRad",
		"Supchik",
		"White Knight",
		"Crowbar_Courier",
		"Lambda Runner",
		"Vortigoon",
		"HEV Tourist",
		"Tripmine Poet",
		"Black Mesa Dad",
		"Resonance Pal"
	];

	const countries = ["US", "CA", "GB", "DE", "PL", "FI", "BR", "AR", "UA", "NL", "SE", "FR"];
	const models = ["barney", "gina", "scientist", "gman", "helmet", "robo", "zombie", ""];
	const clients = [
		{ mod: 1, modStr: "Sven Co-op" },
		{ mod: 2, modStr: "Sven Co-op Classic" },
		{ mod: 4, modStr: "Adrenaline Gamer" }
	];

	function shouldUseMock() {
		const params = new URLSearchParams(window.location.search);
		if (params.get("mock") === "0") {
			return false;
		}
		if (params.get("mock") === "1") {
			return true;
		}
		return ["", "localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
	}

	function aliasDaysAgo(days) {
		return dayNumber() - days;
	}

	function makeMapStats(seed) {
		const stats = {};
		for (let i = 0; i < maps.length; i++) {
			stats[maps[i]] = {
				totalPlays: ((seed + i) % 8) + 1,
				lastPlayed: nowSeconds() - ((seed + i + 1) * daySeconds),
				rating: (seed + i) % 9 === 0 ? 3 : ((seed + i) % 4 === 0 ? 2 : ((seed + i) % 3 === 0 ? 1 : 0))
			};
		}
		return stats;
	}

	function makePlayer(index, overrides) {
		const id = makeId(index + 1);
		const totalHours = 2100 - (index * 93) + ((index % 3) * 17);
		const recentHours = index % 4 === 0 ? 53 - index : 7 + ((index * 11) % 44);
		const firstSeen = nowSeconds() - ((760 - (index * 18)) * daySeconds);
		const lastSeen = nowSeconds() - ((index % 7) * daySeconds);
		const name = names[index % names.length];
		return Object.assign({
			id,
			name,
			steamName: name,
			steamAvatar: index % 2 ? "icon/client_hl.png" : "icon/steam_icon_logo.svg",
			sprayImage: index % 3 ? "icon/client_sk_full.png" : "icon/favorite.png",
			model: models[index % models.length],
			modelImage: index % 5 === 0 ? "icon/missing_pmodel.png" : undefined,
			language: index % 5 === 0 ? "es" : "en",
			mapsPlayed: 770 - (index * 7),
			mapsMultiPlayed: 510 - (index * 5),
			mapsMultiplayed: 510 - (index * 5),
			totalPlayTime: totalHours * 60 * 60,
			recentPlayTime: Math.max(0, recentHours) * 60 * 60,
			firstSeen,
			lastSeen,
			likeCooldown: index % 6,
			mapstats: makeMapStats(index),
			aliases: [
				{
					firstUsed: aliasDaysAgo(720 - index * 7),
					lastUsed: aliasDaysAgo(index % 8),
					timeUsed: totalHours * 60 * 60,
					name
				},
				{
					firstUsed: aliasDaysAgo(260 - index * 3),
					lastUsed: aliasDaysAgo(14 + index),
					timeUsed: Math.max(2, Math.floor(totalHours / 9)) * 60 * 60,
					name: name.replaceAll(" ", "_")
				}
			],
			salt: Date.now()
		}, overrides || {});
	}

	function seedSharedGlobals() {
		const states = {};
		const ids = [];
		for (let i = 0; i < 64; i++) {
			const player = makePlayer(i);
			states[player.id] = player;
			ids.push(player.id);
		}

		g_player_states = states;
		g_player_ids = ids;
		g_map_total = 776;
		g_server_name = "Half-Life Co-op";
		g_most_active_id = ids[0];
		g_update_time = nowSeconds() - 78;
	}

	function seedIpInfo(ids) {
		g_ip_info = {};
		g_player_ips = {};
		g_web_client_ips = {};

		ids.forEach((id, index) => {
			const ip = "10.0." + (index + 12) + "." + (40 + index);
			const country = countries[index % countries.length];
			g_ip_info[ip] = {
				country,
				region: index % 2 ? "Metro relay" : "Dedicated line"
			};
			if (index < 8) {
				g_player_ips[id] = ip;
			} else {
				g_web_client_ips[id] = ip;
			}
		});
	}

	function setupDashboard() {
		document.body.classList.add("mock-mode");
		seedSharedGlobals();
		seedIpInfo(g_player_ids);

		const liveIds = g_player_ids.slice(0, 8);
		g_current_map = maps[0];
		g_next_map = maps[1];
		g_map_cycle = maps.map((map) => [map]);
		g_upcoming_maps = new Set(maps.slice(1, 10));
		g_total_maps = maps.length;
		g_map_start_time = Math.floor(Date.now() / 1000) - (7 * 60 + 22);
		g_map_time_limit = 60 * 60;
		g_map_frag_limit = 0;
		g_player_data = liveIds.map((id, index) => ({
			name: g_player_states[id].name,
			steamid64: id,
			status: index === 3 ? PLAYER_STATUS_DEAD : (index === 6 ? PLAYER_STATUS_IDLE : PLAYER_STATUS_ALIVE),
			flags: index === 5 ? PLAYER_FLAG_BAD_GUY : 0,
			score: 91 - (index * 9),
			deaths: index % 4,
			ping: 24 + (index * 17),
			idleTime: index === 6 ? 94 : index * 2
		}));

		g_web_clients = [g_player_ids[8], g_player_ids[6], g_player_ids[7], g_player_ids[2], g_player_ids[1], g_player_ids[5], 0n, 0n];
		g_guest_names = [];
		for (let i = 0; i < g_player_ids.length; i++) {
			g_player_clients[g_player_ids[i]] = Object.assign({
				os: i % 2,
				renderer: i % 3,
				screenWidth: 1920 - (i % 4) * 160,
				screenHeight: 1080 - (i % 3) * 90
			}, clients[i % clients.length]);
		}

		document.getElementById("server_name").textContent = g_server_name;
		document.getElementById("login_text").textContent = "Sign in with Steam";
		document.getElementById("login_subtext").textContent = "required for some actions";

		update_web_client_info();
		refresh_player_table();
		update_map_data();

		const chat = document.getElementById("chat_box");
		chat.innerHTML = "";
		const messages = [
			[1, "Pewma", "valve", WEBMSG_CHAT_TYPE_NORMAL],
			[2, "Uberdosis", "unitaco", WEBMSG_CHAT_TYPE_NORMAL],
			[3, "Scientist", "An endless cycle...?", WEBMSG_CHAT_TYPE_NORMAL],
			[4, "Soy manco nose jugar", "ahi lo cree", WEBMSG_CHAT_TYPE_NORMAL],
			[5, "Wayne", "medic4", WEBMSG_CHAT_TYPE_NORMAL],
			[0, "-", "Map changed from htc_hl_1 to htc_hl_2", WEBMSG_CHAT_TYPE_SERVER],
			[0, "HUD", "Another door opened..", WEBMSG_CHAT_TYPE_GAME],
			[0, "HUD", "Other door opened when the scientist died..", WEBMSG_CHAT_TYPE_GAME],
			[6, "Lambda Runner", "crowbar check. doors open.", WEBMSG_CHAT_TYPE_NORMAL],
			[7, "Tripmine Poet", "stackdeathpb1 next? this is going to be beautiful chaos", WEBMSG_CHAT_TYPE_NORMAL]
		];

		messages.forEach((line, index) => {
			const id = line[0] ? g_player_ids[line[0] % g_player_ids.length] : 0n;
			const ip = line[0] ? g_player_ips[id] : "";
			const type = line[3];
			add_message(id, ip, line[1], line[2], Date.now() - ((messages.length - index) * 42000), type);
		});
	}

	async function setupStatsMeta() {
		document.body.classList.add("mock-mode");
		seedSharedGlobals();
		document.getElementById("tab_title").textContent = "Player stats - " + g_server_name;
		document.getElementById("server_name").textContent = g_server_name;
		refresh_update_time();
		setInterval(refresh_update_time, 1000, -1);
		await load_shared_html();

		let player_profile = document.getElementById("player_profile");
		player_profile.addEventListener("click", function() {
			player_profile.style.display = "none";
			player_profile.getElementsByClassName("avatar_img")[0].src = "icon/blank.png";
			player_profile.getElementsByClassName("spray_img")[0].src = "icon/blank.png";
			player_profile.getElementsByClassName("pmodel_img")[0].src = "icon/blank.png";
		});
		player_profile.getElementsByClassName("content")[0].addEventListener("click", function(event) {
			event.stopPropagation();
		});
	}

	function populateStatsData() {
		seedSharedGlobals();
		for (let i = 0; i < g_player_ids.length; i++) {
			g_player_clients[g_player_ids[i]] = Object.assign({
				os: i % 2,
				renderer: i % 3,
				screenWidth: 1920,
				screenHeight: 1080
			}, clients[i % clients.length]);
		}
	}

	window.HLCOOP_MOCK = {
		shouldUseMock,
		setupDashboard,
		setupStatsMeta,
		populateStatsData
	};
})();
