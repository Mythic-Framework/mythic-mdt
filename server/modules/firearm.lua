_MDT.Firearm = {
	Search = function(self, term)
		local results = Database:Find('firearms', {
			Scratched = false,
			Serial = Database.LIKE(term),
		})

		if not results or #results == 0 then
			results = Database:Find('firearms', { Scratched = false })
			if results and #term > 0 then
				local lterm = term:lower()
				local filtered = {}
				for k, v in ipairs(results) do
					local match = false
					if v.Serial and v.Serial:lower():find(lterm, 1, true) then
						match = true
					elseif v.Owner then
						local fullName = ((v.Owner.First or '') .. ' ' .. (v.Owner.Last or '')):lower()
						if fullName:find(lterm, 1, true) then
							match = true
						elseif tostring(v.Owner.SID or ''):find(lterm, 1, true) then
							match = true
						end
					end
					if match then
						table.insert(filtered, v)
					end
				end
				results = filtered
			end
		end

		if not results then
			return false
		end
		GlobalState["MDT:Metric:Search"] = GlobalState["MDT:Metric:Search"] + 1
		return results
	end,
	View = function(self, id)
		local result = Database:FindOne('firearms', { _id = id })
		if not result then
			return false
		end
		return result
	end,
	Flags = {
		Add = function(self, id, data)
			local existing = Database:FindOne('firearms', { _id = id })
			if not existing then
				return false
			end
			local flags = existing.Flags or {}
			table.insert(flags, data)
			local affected = Database:Update('firearms', { _id = id }, { Flags = flags })
			return affected and affected > 0
		end,
		Remove = function(self, id, flag)
			local existing = Database:FindOne('firearms', { _id = id })
			if not existing then
				return false
			end
			local flags = existing.Flags or {}
			for k, v in ipairs(flags) do
				if v.Type == flag then
					table.remove(flags, k)
					break
				end
			end
			local affected = Database:Update('firearms', { _id = id }, { Flags = flags })
			return affected and affected > 0
		end,
	},
}

AddEventHandler("MDT:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("MDT:Search:firearm", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Firearm:Search(data.term))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:View:firearm", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Firearm:View(data))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Create:firearm-flag", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Firearm.Flags:Add(data.parentId, data.doc))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Delete:firearm-flag", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Firearm.Flags:Remove(data.parentId, data.id))
		else
			cb(false)
		end
	end)
end)
