_MDT.Warrants = {
	Search = function(self, term)
		local results = Database:Find('mdt_warrants', {})
		if not results then
			return false
		end
		return results
	end,
	View = function(self, id)
		local result = Database:FindOne('mdt_warrants', { _id = id })
		if not result then
			return false
		end
		return result
	end,
	Create = function(self, data)
		local inserted = Database:Insert('mdt_warrants', data)
		if not inserted then
			return false
		end
		data._id = inserted._id
		table.insert(_warrants, data)
		for user, _ in pairs(_onDutyUsers) do
			TriggerClientEvent("MDT:Client:AddData", user, "warrants", data)
		end
		for user, _ in pairs(_onDutyLawyers) do
			TriggerClientEvent("MDT:Client:AddData", user, "warrants", data)
		end
		GlobalState["MDT:Metric:Warrants"] = GlobalState["MDT:Metric:Warrants"] + 1
		return true
	end,
	Update = function(self, id, state, updater)
		local existing = Database:FindOne('mdt_warrants', { _id = id })
		if not existing then
			return false
		end

		local history = existing.history or {}
		table.insert(history, updater)

		local affected = Database:Update('mdt_warrants', { _id = id }, {
			state = state,
			history = json.encode(history),
		})

		if not affected or affected == 0 then
			return false
		end

		for k, v in ipairs(_warrants) do
			if v._id == id then
				v.state = state

				for user, _ in pairs(_onDutyUsers) do
					TriggerClientEvent("MDT:Client:UpdateData", user, "warrants", id, v)
				end

				for user, _ in pairs(_onDutyLawyers) do
					TriggerClientEvent("MDT:Client:UpdateData", user, "warrants", id, v)
				end
			end
		end

		return true
	end,
	-- Delete = function(self, id)
	-- end,
}

AddEventHandler("MDT:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("MDT:Search:warrant", function(source, data, cb)
		local char = Fetch:Source(source):GetData("Character")
		cb(MDT.Warrants:Search(data.term))
	end)

	Callbacks:RegisterServerCallback("MDT:View:warrant", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Warrants:View(data))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Create:warrant", function(source, data, cb)
		local char = Fetch:Source(source):GetData("Character")

		if char and CheckMDTPermissions(source, false) then
			data.doc.author = {
				SID = char:GetData("SID"),
				First = char:GetData("First"),
				Last = char:GetData("Last"),
				Callsign = char:GetData("Callsign"),
			}
			data.doc.ID = Sequence:Get("Warrant")
			cb(MDT.Warrants:Create(data.doc))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Update:warrant", function(source, data, cb)
		local char = Fetch:Source(source):GetData("Character")

		if char and CheckMDTPermissions(source, false) then
			local updater = {
				SID = char:GetData("SID"),
				First = char:GetData("First"),
				Last = char:GetData("Last"),
				Callsign = char:GetData("Callsign"),
				Action = string.format("Updated Warrant State To: %s", data.state),
				Date = os.time() * 1000,
			}
			if CheckMDTPermissions(source, false) then
				cb(MDT.Warrants:Update(data.id, data.state, updater))
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)

	-- Callbacks:RegisterServerCallback("MDT:Delete:warrant", function(source, data, cb)
	-- 	local char = Fetch:Source(source):GetData("Character")

	-- 	if CheckMDTPermissions(source, false) then
	-- 		cb(MDT.Warrants:Delete(data.id))
	-- 	else
	-- 		cb(false)
	-- 	end
	-- end)
end)
