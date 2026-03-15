_MDT.Fleet = {
	ViewFleet = function(self, jobId)
		local p = promise.new()
		Database.Game:find({
			collection = "vehicles",
			query = {
				['Owner.Type'] = 1,
				['Owner.Id'] = jobId,
			},
			options = {
				projection = {
					_id = 0,
					VIN = 1,
					Make = 1,
					Model = 1,
					Type = 1,
					Owner = 1,
					Storage = 1,
					GovAssigned = 1,
					RegistrationDate = 1,
					RegisteredPlate = 1,
				}
			}
		}, function(success, results)
			if not success then
				p:resolve(false)
				return
			end

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

			p:resolve(results)
		end)
		return Citizen.Await(p)
	end,

	SetAssignedDrivers = function(self, VIN, assigned)
		local p = promise.new()
		local ass = {}
		for k, v in ipairs(assigned) do
			table.insert(ass, {
				SID = v.SID,
				First = v.First,
				Last = v.Last,
				Callsign = v.Callsign,
			})
		end

		Database.Game:updateOne({
			collection = "vehicles",
			query = {
				VIN = VIN,
			},
			update = {
				["$set"] = {
					GovAssigned = ass,
				},
			},
		}, function(success, result)
			p:resolve(success)
		end)
		return Citizen.Await(p)
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
