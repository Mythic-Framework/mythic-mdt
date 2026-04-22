_warrants = {}
_charges = {}
_tags = {}
_notices = {}

local _ran = false

function Startup()
	if _ran then
		return
	end
	AddDefaultData()
	RegisterTasks()

	local expired = Database:Update('mdt_warrants', {
		expires = Database.LTE(os.time() * 1000),
	}, {
		state = "expired",
	})

	if expired then
		Logger:Trace("MDT", "Expired ^2" .. expired .. "^7 Old Warrants", { console = true })
	end

	local activeWarrants = Database:Find('mdt_warrants', { state = "active" })
	if activeWarrants then
		Logger:Trace("MDT", "Loaded ^2" .. #activeWarrants .. "^7 Active Warrants", { console = true })
		_warrants = activeWarrants
	end

	local charges = Database:Find('mdt_charges', {})
	if charges then
		Logger:Trace("MDT", "Loaded ^2" .. #charges .. "^7 Charges", { console = true })
		_charges = charges
	end

	local tags = Database:Find('mdt_tags', {})
	if tags then
		Logger:Trace("MDT", "Loaded ^2" .. #tags .. "^7 Tags", { console = true })
		_tags = tags
	end

	local notices = Database:Find('mdt_notices', {})
	if notices then
		Logger:Trace("MDT", "Loaded ^2" .. #notices .. "^7 Notices", { console = true })
		_notices = notices
	end

	local flaggedVehicles = Database:Find('vehicles', { radarFlag = true })
	if flaggedVehicles then
		for k, v in ipairs(flaggedVehicles) do
			if v.RegisteredPlate and v.Type == 0 then
				Radar:AddFlaggedPlate(v.RegisteredPlate, 'Vehicle Flagged in MDT')
			end
		end
	end

	_ran = true

	SetHttpHandler(function(req, res)
		if req.path == '/charges' then
			res.send(json.encode(_charges))
		end
	end)
end
