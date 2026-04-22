local _runningBoloId = 0

_MDT.Misc = {
	Create = {
		BOLO = function (self, data)
			data._id = _runningBoloId
			table.insert(_bolos, data)
			GlobalState['MDT:Metric:BOLOs'] = GlobalState['MDT:Metric:BOLOs'] + 1
			for user, _ in pairs(_onDutyUsers) do
				TriggerClientEvent("MDT:Client:AddData", user, "bolos", data)
			end

			_runningBoloId = _runningBoloId + 1
		end,
		Charge = function(self, data)
			local inserted = Database:Insert('mdt_charges', data)
			if not inserted then
				return false
			end

			data._id = inserted._id
			table.insert(_charges, data)
			for user, _ in pairs(_onDutyUsers) do
				TriggerClientEvent("MDT:Client:AddData", user, "charges", data)
			end
			for user, _ in pairs(_onDutyLawyers) do
				TriggerClientEvent("MDT:Client:AddData", user, "charges", data)
			end
			return inserted._id
		end,
		Tag = function(self, data)
			local inserted = Database:Insert('mdt_tags', data)
			if not inserted then
				return false
			end

			data._id = inserted._id
			table.insert(_tags, data)
			for user, _ in pairs(_onDutyUsers) do
				TriggerClientEvent("MDT:Client:AddData", user, "tags", data)
			end
			for user, _ in pairs(_onDutyLawyers) do
				TriggerClientEvent("MDT:Client:AddData", user, "tags", data)
			end
			return inserted._id
		end,
		Notice = function(self, data)
			local inserted = Database:Insert('mdt_notices', data)
			if not inserted then
				return false
			end

			data._id = inserted._id
			table.insert(_notices, data)

			for user, _ in pairs(_onDutyUsers) do
				TriggerClientEvent("MDT:Client:AddData", user, "notices", data)
			end
			for user, _ in pairs(_onDutyLawyers) do
				TriggerClientEvent("MDT:Client:AddData", user, "notices", data)
			end

			return inserted._id
		end,
	},
	Update = {
		Charge = function(self, id, data)
			local affected = Database:Update('mdt_charges', { _id = id }, {
				title = data.title,
				description = data.description,
				type = data.type,
				fine = data.fine,
				jail = data.jail,
				points = data.points,
			})
			if not affected or affected == 0 then
				return false
			end
			for k, v in ipairs(_charges) do
				if (v._id == id) then
					_charges[k] = data
					break
				end
			end

			-- if data.active then
			-- 	TriggerClientEvent("MDT:Client:UpdateData", -1, "charges", id, data)
			-- else
			-- 	TriggerClientEvent("MDT:Client:RemoveData", -1, "charges", id)
			-- end
			for user, _ in pairs(_onDutyUsers) do
				TriggerClientEvent("MDT:Client:UpdateData", user, "charges", id, data)
			end
			for user, _ in pairs(_onDutyLawyers) do
				TriggerClientEvent("MDT:Client:UpdateData", user, "charges", id, data)
			end
			return true
		end,
		Tag = function(self, id, data)
			local affected = Database:Update('mdt_tags', { _id = id }, {
				name = data.name,
				requiredPermission = data.requiredPermission,
				restrictViewing = data.restrictViewing,
				style = data.style,
			})
			if not affected or affected == 0 then
				return false
			end

			for k, v in ipairs(_tags) do
				if (v._id == id) then
					_tags[k] = data
					break
				end
			end

			for user, _ in pairs(_onDutyUsers) do
				TriggerClientEvent("MDT:Client:UpdateData", user, "tags", id, data)
			end
			for user, _ in pairs(_onDutyLawyers) do
				TriggerClientEvent("MDT:Client:UpdateData", user, "tags", id, data)
			end
			return true
		end,
	},
	Delete = {
		BOLO = function(self, id)
			for k, v in ipairs(_bolos) do
				if v._id == id then
					table.remove(_bolos, k)
					for user, _ in pairs(_onDutyUsers) do
						TriggerClientEvent("MDT:Client:RemoveData", user, "bolos", k)
					end
					return true
				end
			end

			return false
		end,
		Tag = function(self, id)
			local affected = Database:Delete('mdt_tags', { _id = id })
			if not affected or affected == 0 then
				return false
			end

			for k, v in ipairs(_tags) do
				if (v._id == id) then
					table.remove(_tags, k)
					break
				end
			end

			for user, _ in pairs(_onDutyUsers) do
				TriggerClientEvent("MDT:Client:RemoveData", user, "tags", id)
			end
			for user, _ in pairs(_onDutyLawyers) do
				TriggerClientEvent("MDT:Client:RemoveData", user, "tags", id)
			end
			return true
		end,
		Notice = function(self, id)
			local affected = Database:Delete('mdt_notices', { _id = id })
			if not affected or affected == 0 then
				return false
			end

			for k, v in ipairs(_notices) do
				if (v._id == id) then
					table.remove(_notices, k)
					break
				end
			end

			for user, _ in pairs(_onDutyUsers) do
				TriggerClientEvent("MDT:Client:RemoveData", user, "notices", id)
			end
			for user, _ in pairs(_onDutyLawyers) do
				TriggerClientEvent("MDT:Client:RemoveData", user, "notices", id)
			end
			return true
		end,
	}
}


AddEventHandler("MDT:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("MDT:Create:BOLO", function(source, data, cb)
		local char = Fetch:Source(source):GetData("Character")
		if CheckMDTPermissions(source, false, 'police') then
			data.doc.author = {
				SID = char:GetData("SID"),
				First = char:GetData("First"),
				Last = char:GetData("Last"),
				Callsign = char:GetData("Callsign"),
			}
			MDT.Misc.Create:BOLO(data.doc)
			cb(true)
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Delete:BOLO", function(source, data, cb)
		if CheckMDTPermissions(source, false, 'police') then
			cb(MDT.Misc.Delete:BOLO(data.id))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Create:charge", function(source, data, cb)
		if CheckMDTPermissions(source, true) then
			data.doc.active = true
			cb(MDT.Misc.Create:Charge(data.doc))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Update:charge", function(source, data, cb)
		if CheckMDTPermissions(source, true) then
			cb(MDT.Misc.Update:Charge(data.doc._id, data.doc))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Create:tag", function(source, data, cb)
		if CheckMDTPermissions(source, true) then
			data.doc.active = true
			cb(MDT.Misc.Create:Tag(data.doc))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Update:tag", function(source, data, cb)
		if CheckMDTPermissions(source, true) then
			cb(MDT.Misc.Update:Tag(data.doc._id, data.doc))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Delete:tag", function(source, data, cb)
		if CheckMDTPermissions(source, true) then
			cb(MDT.Misc.Delete:Tag(data.id))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Create:notice", function(source, data, cb)
		if CheckMDTPermissions(source, {
			'PD_HIGH_COMMAND',
			'SAFD_HIGH_COMMAND',
		}) then
			cb(MDT.Misc.Create:Notice(data.doc))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Delete:notice", function(source, data, cb)
		if CheckMDTPermissions(source, {
			'PD_HIGH_COMMAND',
			'SAFD_HIGH_COMMAND',
		}) then
			cb(MDT.Misc.Delete:Notice(data.id))
		else
			cb(false)
		end
	end)
end)
