_MDT.Vehicles = {
	Search = function(self, term)
		local results = Database:Find('vehicles', {
			RegisteredPlate = Database.LIKE(term),
		}, { limit = 24 })

		GlobalState['MDT:Metric:Search'] = GlobalState['MDT:Metric:Search'] + 1
		return results or false
	end,
	View = function(self, VIN)
		local vehicle = Database:FindOne('vehicles', { VIN = VIN })
		if not vehicle then
			return false
		end

		if vehicle.Owner then
			if vehicle.Owner.Type == 0 then
				vehicle.Owner.Person = MDT.People:View(vehicle.Owner.Id)
			elseif vehicle.Owner.Type == 1 or vehicle.Owner.Type == 2 then
				local jobData = Jobs:DoesExist(vehicle.Owner.Id, vehicle.Owner.Workplace)
				if jobData then
					if jobData.Workplace then
						vehicle.Owner.JobName = string.format('%s (%s)', jobData.Name, jobData.Workplace.Name)
					else
						vehicle.Owner.JobName = jobData.Name
					end
				end
			end

			if vehicle.Owner.Type == 2 then
				vehicle.Owner.JobName = vehicle.Owner.JobName .. " (Dealership Buyback)"
			end
		end

		if vehicle.Storage then
			if vehicle.Storage.Type == 0 then
				vehicle.Storage.Name = Vehicles.Garages:Impound().name
			elseif vehicle.Storage.Type == 1 then
				local garage = Vehicles.Garages:Get(vehicle.Storage.Id)
				vehicle.Storage.Name = garage and garage.name or "Unknown Garage"
			elseif vehicle.Storage.Type == 2 then
				local prop = Properties:Get(vehicle.Storage.Id)
				vehicle.Storage.Name = prop and prop.label or "Unknown Property"
			end
		end

		if vehicle.RegisteredPlate then
			local flagged = Radar:CheckPlate(vehicle.RegisteredPlate)
			if flagged and flagged ~= "Vehicle Flagged in MDT" then
				vehicle.RadarFlag = flagged
			end
		end

		return vehicle
	end,
	Flags = {
		Add = function(self, VIN, data, plate)
			local existing = Database:FindOne('vehicles', { VIN = VIN })
			if not existing then
				return false
			end
			local flags = existing.Flags or {}
			table.insert(flags, data)
			local affected = Database:Update('vehicles', { VIN = VIN }, { Flags = flags })
			local success = affected and affected > 0
			if success and data.radarFlag and plate then
				Radar:AddFlaggedPlate(plate, 'Vehicle Flagged in MDT')
			end
			return success
		end,
		Remove = function(self, VIN, flag)
			local existing = Database:FindOne('vehicles', { VIN = VIN })
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
			local affected = Database:Update('vehicles', { VIN = VIN }, { Flags = flags })
			return affected and affected > 0
		end,
	},
	UpdateStrikes = function(self, VIN, strikes)
		local affected = Database:Update('vehicles', { VIN = VIN }, { Strikes = strikes })
		return affected and affected > 0
	end,
	GetStrikes = function(self, VIN)
		local veh = Database:FindOne('vehicles', { VIN = VIN })
		if veh then
			local strikes = 0
			if veh.Strikes and #veh.Strikes > 0 then
				strikes = #veh.Strikes
			end
			return strikes
		end
		return 0
	end
}

AddEventHandler("MDT:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("MDT:Search:vehicle", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Vehicles:Search(data.term))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:View:vehicle", function(source, data, cb)
		if CheckMDTPermissions(source, false) then
			cb(MDT.Vehicles:View(data))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Create:vehicle-flag", function(source, data, cb)
		if CheckMDTPermissions(source, false, 'police') then
			cb(MDT.Vehicles.Flags:Add(data.parent, data.doc, data.plate))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Delete:vehicle-flag", function(source, data, cb)
		if CheckMDTPermissions(source, false, 'police') then
			cb(MDT.Vehicles.Flags:Remove(data.parent, data.id))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:Update:vehicle-strikes", function(source, data, cb)
		if CheckMDTPermissions(source, false, 'police') then
			cb(MDT.Vehicles:UpdateStrikes(data.VIN, data.strikes))
		else
			cb(false)
		end
	end)
end)
