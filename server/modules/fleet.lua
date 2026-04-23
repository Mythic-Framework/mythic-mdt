_MDT.Fleet = {
	ViewFleet = function(self, jobId)
		local all = Database:Find('vehicles', { OwnerType = 1 })
		if not all then return false end
		local results = {}
		for _, v in ipairs(all) do
			if v.Owner and tostring(v.Owner.Id) == tostring(jobId) then
				table.insert(results, v)
			end
		end
		if #results == 0 then return {} end

		for k, v in ipairs(results) do
			if v.Storage then
				if v.Storage.Type == 0 then
					local impound = Vehicles.Garages:Impound()
					v.Storage.Name = impound and impound.name or "Impound"
				elseif v.Storage.Type == 1 then
					local garage = Vehicles.Garages:Get(v.Storage.Id)
					v.Storage.Name = garage and garage.name or "Garage"
				elseif v.Storage.Type == 2 then
					local prop = Properties:Get(v.Storage.Id)
					v.Storage.Name = prop and prop.label or "Property"
				end
			end
		end

		return results
	end,

	SetAssignedDrivers = function(self, VIN, assigned)
		local ass = {}
		for k, v in ipairs(assigned) do
			table.insert(ass, {
				SID = v.SID,
				First = v.First,
				Last = v.Last,
				Callsign = v.Callsign,
			})
		end

		local affected = Database:Update('vehicles', { VIN = VIN }, { GovAssigned = ass })
		return affected and affected > 0
	end,

	TrackVehicle = function(self, VIN)
		return Vehicles.Owned:Track(VIN)
	end,
}

AddEventHandler("MDT:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("MDT:ViewVehicleFleet", function(source, data, cb)
		local hasPerms, loggedInJob = CheckMDTPermissions(source, 'FLEET_MANAGEMENT')
		if hasPerms and loggedInJob then
			cb(_MDT.Fleet:ViewFleet(loggedInJob))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:SetAssignedDrivers", function(source, data, cb)
		local hasPerms, loggedInJob = CheckMDTPermissions(source, 'FLEET_MANAGEMENT')
		if hasPerms and loggedInJob and data.vehicle and data.assigned then
			cb(_MDT.Fleet:SetAssignedDrivers(data.vehicle, data.assigned))
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:TrackFleetVehicle", function(source, data, cb)
		local hasPerms, loggedInJob = CheckMDTPermissions(source, 'FLEET_MANAGEMENT')
		if hasPerms and loggedInJob and data.vehicle then
			cb(_MDT.Fleet:TrackVehicle(data.vehicle))
		else
			cb(false)
		end
	end)
end)
