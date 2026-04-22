local requiredCharacterData = {
	SID = 1,
	User = 1,
	First = 1,
	Last = 1,
	Gender = 1,
	Origin = 1,
	Jobs = 1,
	DOB = 1,
	Callsign = 1,
	Phone = 1,
	Licenses = 1,
	Qualifications = 1,
	Flags = 1,
	Mugshot = 1,
	MDTSystemAdmin = 1,
	MDTHistory = 1,
	Attorney = 1,
	LastClockOn = 1,
	TimeClockedOn = 1,
}

_MDT.People = {
	Search = {
		People = function(self, term)
			local results = Database:Find('characters', {
				_search = term,
				Deleted = Database.NE(true),
			}, { limit = 12 })

			if not results then
				return false
			end

			if term and #term > 0 then
				local lterm = term:lower()
				local filtered = {}
				for k, v in ipairs(results) do
					local fullName = ((v.First or '') .. ' ' .. (v.Last or '')):lower()
					if fullName:find(lterm, 1, true) or tostring(v.SID or ''):find(lterm, 1, true) then
						table.insert(filtered, v)
					end
				end
				results = filtered
			end

			GlobalState["MDT:Metric:Search"] = GlobalState["MDT:Metric:Search"] + 1
			return results
		end,
		Government = function(self)
			local govSet = {}
			for _, j in ipairs(_governmentJobs) do govSet[j] = true end
			local all = Database:Find('characters', { Deleted = Database.NE(true) })
			if not all then return false end
			local filtered = {}
			for _, c in ipairs(all) do
				if c.Jobs then
					for _, j in ipairs(c.Jobs) do
						if govSet[j.Id] then
							table.insert(filtered, c)
							break
						end
					end
				end
			end
			return #filtered > 0 and filtered or false
		end,
		NotGovernment = function(self)
			local govSet = {}
			for _, j in ipairs(_governmentJobs) do govSet[j] = true end
			local all = Database:Find('characters', { Deleted = Database.NE(true) })
			if not all then return false end
			local filtered = {}
			for _, c in ipairs(all) do
				local hasGov = false
				if c.Jobs then
					for _, j in ipairs(c.Jobs) do
						if govSet[j.Id] then hasGov = true break end
					end
				end
				if not hasGov then table.insert(filtered, c) end
			end
			return #filtered > 0 and filtered or false
		end,
		Job = function(self, job, term)
			local all = Database:Find('characters', { Deleted = Database.NE(true) })
			if not all then return false end
			local lterm = term and #term > 0 and term:lower() or nil
			local filtered = {}
			for _, c in ipairs(all) do
				local hasJob = false
				if c.Jobs then
					for _, j in ipairs(c.Jobs) do
						if j.Id == job then hasJob = true break end
					end
				end
				if hasJob then
					if lterm then
						local fullName = ((c.First or '') .. ' ' .. (c.Last or '')):lower()
						if fullName:find(lterm, 1, true) or tostring(c.SID or ''):find(lterm, 1, true) then
							table.insert(filtered, c)
						end
					else
						table.insert(filtered, c)
					end
				end
			end
			return #filtered > 0 and filtered or false
		end,
		NotJob = function(self, job)
			local all = Database:Find('characters', { Deleted = Database.NE(true) })
			if not all then return false end
			local filtered = {}
			for _, c in ipairs(all) do
				local hasJob = false
				if c.Jobs then
					for _, j in ipairs(c.Jobs) do
						if j.Id == job then hasJob = true break end
					end
				end
				if not hasJob then table.insert(filtered, c) end
			end
			return #filtered > 0 and filtered or false
		end,
	},
	View = function(self, id, requireAllData)
		local SID = tonumber(id)
		local character = Database:FindOne('characters', { SID = SID })
		if not character then
			return false
		end

		if requireAllData then
			local convictions = Database:FindOne('character_convictions', { SID = SID })
			local allVehicles = Database:Find('vehicles', { OwnerType = 0 })
			local vehicles = {}
			if allVehicles then
				for _, v in ipairs(allVehicles) do
					if v.Owner and tostring(v.Owner.Id) == tostring(SID) then
						table.insert(vehicles, v)
					end
				end
			end

			if not vehicles then
				vehicles = {}
			end

			local ownedBusinesses = {}

			if character.Jobs then
				for k, v in ipairs(character.Jobs) do
					local jobData = Jobs:Get(v.Id)
					if jobData.Owner and jobData.Owner == character.SID then
						table.insert(ownedBusinesses, v.Id)
					end
				end
			end

			return {
				data = character,
				convictions = convictions,
				vehicles = vehicles,
				ownedBusinesses = ownedBusinesses,
			}
		else
			return character
		end
	end,
	Update = function(self, requester, id, key, value)
		local logVal = value
		if type(value) == "table" then
			logVal = json.encode(value)
		end

		local existing = Database:FindOne('characters', { SID = id })
		local rawHistory = existing and existing.MDTHistory
		local history = type(rawHistory) == 'table' and rawHistory or {}

		if requester == -1 then
			table.insert(history, {
				Time = (os.time() * 1000),
				Char = -1,
				Log = string.format("System Updated Profile, Set %s To %s", key, logVal),
			})
		else
			table.insert(history, {
				Time = (os.time() * 1000),
				Char = requester:GetData("SID"),
				Log = string.format(
					"%s Updated Profile, Set %s To %s",
					requester:GetData("First") .. " " .. requester:GetData("Last"),
					key,
					logVal
				),
			})
		end

		local updateFields = {
			[key] = value,
			MDTHistory = history,
		}

		local affected = Database:Update('characters', { SID = id }, updateFields)
		if affected and affected > 0 then
			local target = Fetch:SID(id)
			if target then
				target:GetData("Character"):SetData(key, value)
			end
			return true
		end
		return false
	end,
}

AddEventHandler("MDT:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("MDT:Search:people", function(source, data, cb)
		cb(MDT.People.Search:People(data.term))
	end)

	Callbacks:RegisterServerCallback("MDT:Search:government", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.People.Search:Government(data.term))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Search:not-government", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.People.Search:NotGovernment(data.term))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Search:job", function(source, data, cb)
		if CheckMDTPermissions(source, false) or CheckBusinessPermissions(source) then
			cb(MDT.People.Search:Job(data.job, data.term))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Search:not-job", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.People.Search:NotJob(data.job, data.term))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:View:person", function(source, data, cb)
		cb(MDT.People:View(data, true))
	end)

	Callbacks:RegisterServerCallback("MDT:Update:person", function(source, data, cb)
		local char = Fetch:Source(source):GetData("Character")
		if char and CheckMDTPermissions(source, false) and data.SID then
			cb(MDT.People:Update(char, data.SID, data.Key, data.Data))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:CheckCallsign", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			local result = Database:FindOne('characters', { Callsign = data })
			cb(result == nil)
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:CheckParole", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			local result = Database:FindOne('characters', { SID = data })
			if result and result.Parole ~= nil then
				cb(result.Parole)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)
end)
