_MDT.Properties = {
	Search = function(self, term)
		local results = Database:Find('properties', {
			type = Database.NE('container'),
			unlisted = Database.NE(true),
		}, { limit = 24 })

		if not results then
			return false
		end

		if term and #term > 0 then
			local lterm = term:lower()
			local filtered = {}
			for k, v in ipairs(results) do
				local match = false
				if v.label and v.label:lower():find(lterm, 1, true) then
					match = true
				elseif v.owner then
					if tostring(v.owner.SID or ''):find(lterm, 1, true) then
						match = true
					else
						local fullName = ((v.owner.First or '') .. ' ' .. (v.owner.Last or '')):lower()
						if fullName:find(lterm, 1, true) then
							match = true
						end
					end
				end
				if match then
					table.insert(filtered, v)
				end
			end
			results = filtered
		end

		GlobalState['MDT:Metric:Search'] = GlobalState['MDT:Metric:Search'] + 1
		return results
	end,
	-- View = function(self, VIN)
	-- end,
}

AddEventHandler("MDT:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("MDT:Search:property", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Properties:Search(data.term))
		else
			cb(false)
		end
	end)

	-- Callbacks:RegisterServerCallback("MDT:View:vehicle", function(source, data, cb)
	-- 	if CheckMDTPermissions(source, false) then
	-- 		cb(MDT.Vehicles:View(data))
	-- 	else
	-- 		cb(false)
	-- 	end
	-- end)
end)
