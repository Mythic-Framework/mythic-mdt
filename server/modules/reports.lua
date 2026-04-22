_MDT.Reports = {
	Search = function(self, term, type, tagsFilter)
        if not term then term = '' end

		local where = {}

		if type then
			where.type = type
		end

		local results = Database:Find('mdt_reports', where, {
			sort = { field = 'time', dir = 'DESC' },
			limit = (#term <= 0) and 24 or nil,
		})

		if not results then
			return false
		end

		if #term > 0 then
			local filtered = {}
			local lterm = term:lower()
			for k, v in ipairs(results) do
				local match = false
				if v.title and v.title:lower():find(lterm, 1, true) then
					match = true
				elseif tostring(v.ID or ''):lower():find(lterm, 1, true) then
					match = true
				elseif v.suspects and v.suspects.suspect then
					for _, s in ipairs(v.suspects.suspect) do
						local fullName = ((s.First or '') .. ' ' .. (s.Last or '')):lower()
						if fullName:find(lterm, 1, true) then
							match = true
							break
						end
					end
				end
				if match then
					table.insert(filtered, v)
				end
			end
			results = filtered
		end

		if tagsFilter and #tagsFilter > 0 then
			local tagSet = {}
			for _, t in ipairs(tagsFilter) do tagSet[t] = true end
			local filtered = {}
			for k, v in ipairs(results) do
				if v.tags then
					for _, tag in ipairs(v.tags) do
						if tagSet[tag] then
							table.insert(filtered, v)
							break
						end
					end
				end
			end
			results = filtered
		end

		GlobalState['MDT:Metric:Search'] = GlobalState['MDT:Metric:Search'] + 1
		return results
	end,
    SearchEvidence = function(self, term)
        if not term then term = '' end

		local results = Database:Find('mdt_reports', {}, {
			sort = { field = 'time', dir = 'DESC' },
			limit = (#term <= 0) and 24 or nil,
		})

		if not results then
			return false
		end

		if #term > 0 then
			local filtered = {}
			local lterm = term:lower()
			for k, v in ipairs(results) do
				if v.evidence then
					for _, e in ipairs(v.evidence) do
						if e.value and e.value:lower():find(lterm, 1, true) then
							table.insert(filtered, v)
							break
						end
					end
				end
			end
			results = filtered
		end

		GlobalState['MDT:Metric:Search'] = GlobalState['MDT:Metric:Search'] + 1
		return results
	end,
	Mine = function(self, char)
		local results = Database:Find('mdt_reports', {
			author_SID = char:GetData("SID"),
		})
		if not results then
			return false
		end
		GlobalState['MDT:Metric:Search'] = GlobalState['MDT:Metric:Search'] + 1
		return results
	end,
	View = function(self, id)
		local report = Database:FindOne('mdt_reports', { _id = id })
		if not report then
			return false
		end
		return report
	end,
	Create = function(self, data)
        data.ID = Sequence:Get('Report')
		local inserted = Database:Insert('mdt_reports', data)
		if not inserted then
			return false
		end
		GlobalState['MDT:Metric:Reports'] = GlobalState['MDT:Metric:Reports'] + 1
		return {
			_id = inserted._id,
			ID = data.ID,
		}
	end,
	Update = function(self, id, char, report)
		local existing = Database:FindOne('mdt_reports', { _id = id })
		if not existing then
			return false
		end

		local history = existing.history or {}
		table.insert(history, {
			Time = (os.time() * 1000),
			Char = char:GetData("SID"),
			Log = string.format(
				"%s Updated Report",
				char:GetData("First") .. " " .. char:GetData("Last")
			),
		})

		local updateFields = {}
		for k, v in pairs(report) do
			updateFields[k] = v
		end
		updateFields.history = history

		local affected = Database:Update('mdt_reports', { _id = id }, updateFields)
		return affected and affected > 0
	end,
    Delete = function(self, id)
		local affected = Database:Delete('mdt_reports', { _id = id })
		return affected and affected > 0
    end,
}

AddEventHandler("MDT:Server:RegisterCallbacks", function()
    Callbacks:RegisterServerCallback("MDT:Search:report", function(source, data, cb)
        local char = Fetch:Source(source):GetData("Character")
		if CheckMDTPermissions(source, false) or char:GetData("Attorney") then
			cb(MDT.Reports:Search(data.term, data.reportType, data.tags))
		else
			cb(false)
		end
    end)

    Callbacks:RegisterServerCallback("MDT:Search:report-evidence", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Reports:SearchEvidence(data.term))
		else
			cb(false)
		end
    end)

    Callbacks:RegisterServerCallback("MDT:Search:myReport", function(source, data, cb)
        -- local char = Fetch:Source(source):GetData("Character")
		-- if char:GetData('Job').Id == 'police' then
		-- 	cb(MDT.Reports:Mine(char))
		-- else
		-- 	cb(false)
		-- end
    end)

    Callbacks:RegisterServerCallback("MDT:Create:report", function(source, data, cb)
        local char = Fetch:Source(source):GetData("Character")
		if CheckMDTPermissions(source, false) then
			data.doc.author = {
				SID = char:GetData("SID"),
				First = char:GetData("First"),
				Last = char:GetData("Last"),
				Callsign = char:GetData("Callsign"),
			}
			data.doc.author_SID = char:GetData("SID")
			cb(MDT.Reports:Create(data.doc))
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback("MDT:Update:report", function(source, data, cb)
        local char = Fetch:Source(source):GetData('Character')
		if char and CheckMDTPermissions(source, false) then
            data.Report.lastUpdated = {
                Time = (os.time() * 1000),
                SID = char:GetData("SID"),
                First = char:GetData("First"),
                Last = char:GetData("Last"),
                Callsign = char:GetData("Callsign"),
            }
			cb(MDT.Reports:Update(data.ID, char, data.Report))
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback("MDT:Delete:report", function(source, data, cb)
		if CheckMDTPermissions(source, true) then
			cb(MDT.Reports:Delete(data.id))
        else
            cb(false)
        end
    end)

    Callbacks:RegisterServerCallback("MDT:View:report", function(source, data, cb)
        local char = Fetch:Source(source):GetData("Character")
		if CheckMDTPermissions(source, false) or char:GetData("Attorney") then
			cb(MDT.Reports:View(data))
        else
			cb(false)
		end
    end)
end)
