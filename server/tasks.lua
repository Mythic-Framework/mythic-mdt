function RegisterTasks()
    Tasks:Register('mdt_warrants', 30, function()
		Logger:Trace('MDT', 'Expiring Warrants')
		local filteredWarrants = {}
        for k, v in ipairs(_warrants) do
            if v.expires < (os.time() * 1000) then
				for user, _ in pairs(_onDutyUsers) do
					TriggerClientEvent("MDT:Client:RemoveData", user, "warrants", v._id)
				end
			else
				table.insert(filteredWarrants, v)
			end
        end

		_warrants = filteredWarrants
    end)

    Tasks:Register('mdt_metrics', 5, function()
		Logger:Trace('MDT', 'Metrics Stored')
		local currentDay = GlobalState['MDT:Metric:CurrentDay']
		if currentDay then
			Database:Upsert('mdt_metrics', {
				date = currentDay
			}, {
				date = currentDay,
				Arrests = GlobalState["MDT:Metric:Arrests"] or 0,
				Reports = GlobalState["MDT:Metric:Reports"] or 0,
				Warrants = GlobalState["MDT:Metric:Warrants"] or 0,
				BOLOs = GlobalState["MDT:Metric:BOLOs"] or 0,
				Searches = GlobalState["MDT:Metric:Search"] or 0,
			})
		end
    end)

    Tasks:Register('mdt_metrics_time', 30, function()
		Logger:Trace('MDT', 'Validating Metric Key')
		local date = os.date("*t")
		local t = string.format('%s/%s/%s', date.month, date.day, date.year)
		if t ~= GlobalState['MDT:Metric:CurrentDay'] then
			Logger:Trace('MDT', 'New Day, Resetting Metrics')
			local currentDay = GlobalState['MDT:Metric:CurrentDay']
			if currentDay then
				Database:Upsert('mdt_metrics', {
					date = currentDay
				}, {
					date = currentDay,
					Arrests = GlobalState["MDT:Metric:Arrests"] or 0,
					Reports = GlobalState["MDT:Metric:Reports"] or 0,
					Warrants = GlobalState["MDT:Metric:Warrants"] or 0,
					BOLOs = GlobalState["MDT:Metric:BOLOs"] or 0,
					Searches = GlobalState["MDT:Metric:Search"] or 0,
				})
			end
			GlobalState['MDT:Metric:CurrentDay'] = t
			GlobalState["MDT:Metric:Arrests"] = 0
			GlobalState["MDT:Metric:Reports"] = 0
			GlobalState["MDT:Metric:Warrants"] = 0
			GlobalState["MDT:Metric:BOLOs"] = 0
			GlobalState["MDT:Metric:Search"] = 0
		end
    end)
end
