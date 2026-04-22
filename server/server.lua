_MDT = _MDT or {}
_bolos = {}
_breakpoints = {
	reduction = 25,
	license = 12,
}

local governmentJobs = {
	police = true,
	government = true,
	ems = true,
	tow = true,
}

local _editingReports = {}

_onDutyUsers = {}
_onDutyLawyers = {}

_governmentJobData = {}

local sentencedSuspects = {}

AddEventHandler("MDT:Shared:DependencyUpdate", RetrieveComponents)
function RetrieveComponents()
	Fetch = exports["mythic-base"]:FetchComponent("Fetch")
	Database = exports["mythic-base"]:FetchComponent("Database")
	Callbacks = exports["mythic-base"]:FetchComponent("Callbacks")
	Logger = exports["mythic-base"]:FetchComponent("Logger")
	Utils = exports["mythic-base"]:FetchComponent("Utils")
	Chat = exports["mythic-base"]:FetchComponent("Chat")
	Middleware = exports["mythic-base"]:FetchComponent("Middleware")
	Execute = exports["mythic-base"]:FetchComponent("Execute")
	Tasks = exports["mythic-base"]:FetchComponent("Tasks")
	Sequence = exports["mythic-base"]:FetchComponent("Sequence")
	MDT = exports["mythic-base"]:FetchComponent("MDT")
	Jobs = exports["mythic-base"]:FetchComponent("Jobs")
	Inventory = exports["mythic-base"]:FetchComponent("Inventory")
	Default = exports["mythic-base"]:FetchComponent("Default")
	Vehicles = exports["mythic-base"]:FetchComponent("Vehicles")
	Properties = exports["mythic-base"]:FetchComponent("Properties")
	Radar = exports["mythic-base"]:FetchComponent("Radar")
	Version = exports["mythic-base"]:FetchComponent("Version")
	RegisterChatCommands()
end

AddEventHandler("Core:Shared:Ready", function()
	exports["mythic-base"]:RequestDependencies("MDT", {
		"Fetch",
		"Database",
		"Callbacks",
		"Logger",
		"Utils",
		"Chat",
		"Phone",
		"Middleware",
		"Execute",
		"Tasks",
		"Sequence",
		"MDT",
		"Jobs",
		"Inventory",
		"Default",
		"Vehicles",
		"Properties",
		"Radar",
		"Version",
	}, function(error)
		if #error > 0 then
			return
		end
		RetrieveComponents()
		DefaultData()
		RegisterMiddleware()
		Startup()
		MetricsStartup()
		TriggerEvent("MDT:Server:RegisterCallbacks")

		Wait(2500)
		UpdateMDTJobsData()

		Version:Check('Mythic-Framework/Mythic-VersionCheckers', GetCurrentResourceName())
	end)
end)

AddEventHandler("Proxy:Shared:RegisterReady", function()
	exports["mythic-base"]:RegisterComponent("MDT", _MDT)
end)

function RegisterMiddleware()
    Middleware:Add('Characters:Spawning', function(source)
		local char = Fetch:Source(source):GetData('Character')
		if char and char:GetData("Attorney") then
			SetTimeout(5000, function()
				TriggerClientEvent("MDT:Client:Login", source, nil, nil, nil, true)
				_onDutyLawyers[source] = char:GetData('SID')

				TriggerClientEvent("MDT:Client:SetData", source, "governmentJobs", _governmentJobs)
				TriggerClientEvent("MDT:Client:SetData", source, "charges", _charges)
				TriggerClientEvent("MDT:Client:SetData", source, "tags", _tags)
				TriggerClientEvent("MDT:Client:SetData", source, "notices", _notices)
				TriggerClientEvent("MDT:Client:SetData", source, "warrants", _warrants)
				TriggerClientEvent("MDT:Client:SetData", source, "governmentJobsData", _governmentJobData)
			end)
		end
    end, 50)

	Middleware:Add('Characters:Logout', function(source)
		local char = Fetch:Source(source):GetData('Character')
		if char then
			_onDutyLawyers[source] = nil
		end
	end)
end

function UpdateMDTJobsData()
	local newData = {}
	local allJobData = Jobs:GetAll()
	for k, v in ipairs(_governmentJobs) do
		newData[v] = allJobData[v]
	end

	_governmentJobData = newData
	TriggerClientEvent("MDT:Client:SetData", -1, "governmentJobsData", _governmentJobData)
end

AddEventHandler('Jobs:Server:UpdatedCache', function(job)
	if job == -1 or governmentJobs[job] then
		UpdateMDTJobsData()
	end
end)

AddEventHandler('Job:Server:DutyAdd', function(dutyData, source, SID)
	if governmentJobs[dutyData.Id] then
		local job = Jobs.Permissions:HasJob(source, dutyData.Id)
		if job then
			_onDutyUsers[source] = job.Id
			local permissions = Jobs.Permissions:GetPermissionsFromJob(source, job.Id)

			-- This is a yikes
			TriggerClientEvent("MDT:Client:SetData", source, "governmentJobs", _governmentJobs)
			TriggerClientEvent("MDT:Client:SetData", source, "charges", _charges)
			TriggerClientEvent("MDT:Client:SetData", source, "tags", _tags)
			TriggerClientEvent("MDT:Client:SetData", source, "notices", _notices)
			TriggerClientEvent("MDT:Client:SetData", source, "governmentJobsData", _governmentJobData)

			TriggerClientEvent("MDT:Client:SetData", source, "permissions", _permissions)
			TriggerClientEvent("MDT:Client:SetData", source, "qualifications", _qualifications)
			TriggerClientEvent("MDT:Client:SetData", source, "bolos", _bolos)
			TriggerClientEvent("MDT:Client:SetData", source, "warrants", _warrants)

			TriggerClientEvent("MDT:Client:Login", source, _breakpoints, job, permissions)
		end
	end
end)

AddEventHandler('Jobs:Server:JobUpdate', function(source)
	local dutyData = Jobs.Duty:Get(source)
	if dutyData and governmentJobs[dutyData.Id] then
		local job = Jobs.Permissions:HasJob(source, dutyData.Id)
		if job then
			local permissions = Jobs.Permissions:GetPermissionsFromJob(source, job.Id)
			TriggerClientEvent('MDT:Client:UpdateJobData', source, job, permissions)
		end
	end
end)

AddEventHandler('Job:Server:DutyRemove', function(dutyData, source, SID)
	if governmentJobs[dutyData.Id] then
		_onDutyUsers[source] = nil
		TriggerClientEvent("MDT:Client:Logout", source)
	end
end)

function CheckMDTPermissions(source, permission, jobId)
	local mdtUser = _onDutyUsers[source]
	if mdtUser and (not jobId or jobId == mdtUser or (type(jobId) == 'table' and jobId[mdtUser])) then
		if not permission then
			return true
		end

		if type(permission) == 'string' then
			local hasPerm = Jobs.Permissions:HasPermissionInJob(source, mdtUser, permission)
			if hasPerm then
				return true, mdtUser
			end
		elseif type(permission) == 'table' then
			local jobPermissions = Jobs.Permissions:GetPermissionsFromJob(source, mdtUser)
			for k, v in ipairs(permission) do
				if jobPermissions[v] then
					return true, mdtUser
				end
			end
		end

		local char = Fetch:Source(source):GetData('Character')
		if char:GetData('MDTSystemAdmin') then -- They have all permissions
			return true, mdtUser
		end
	end
	return false
end

RegisterNetEvent('MDT:Server:OpenPublicRecords', function()
	local src = source
	local dutyData = Jobs.Duty:Get(src)
	local dumbStuff = false

	if dutyData?.Id then
		TriggerClientEvent("MDT:Client:Logout", source)
		dumbStuff = true

		Wait(1500)
	end

	if not _onDutyUsers[src] then
		TriggerClientEvent("MDT:Client:SetData", src, "governmentJobs", _governmentJobs)
		TriggerClientEvent("MDT:Client:SetData", src, "charges", _charges)
		TriggerClientEvent("MDT:Client:SetData", src, "tags", _tags)
		TriggerClientEvent("MDT:Client:SetData", src, "notices", _notices)
		TriggerClientEvent("MDT:Client:SetData", src, "warrants", _warrants)
		TriggerClientEvent("MDT:Client:SetData", src, "governmentJobsData", _governmentJobData)
	end

	TriggerClientEvent('MDT:Client:Toggle', src, dumbStuff)
end)

AddEventHandler("MDT:Server:RegisterCallbacks", function()
	Callbacks:RegisterServerCallback("MDT:Admin:SetMaxReduction", function(source, data, cb)
		--TODO: Set max reduction and dispatch to all clients
	end)

	Callbacks:RegisterServerCallback("MDT:SentencePlayer", function(source, data, cb)
		local char = Fetch:Source(source):GetData("Character")

		if CheckMDTPermissions(source, false) and data.report and not _editingReports[data.report] then
			_editingReports[data.report] = true

			if not sentencedSuspects[data.report] then
				sentencedSuspects[data.report] = {}
			end

			if data.data.suspect.SID and not sentencedSuspects[data.report][data.data.suspect.SID] then
				local report = Database:FindOne('mdt_reports', { ID = data.report })
				if not report then
					_editingReports[data.report] = nil
					cb(false)
					return
				end

				local suspects = report.suspects or {}
				local suspectList = suspects.suspect or {}
				local sentenceData = {
					time = os.time() * 1000,
					fine = data.fine,
					jail = data.jail,
					months = data.jail,
					revoked = data.sentence.revoke,
					doc = data.sentence.doc,
					reduction = {
						type = data.sentence.type,
						value = data.sentence.value,
					},
					parole = data.parole,
					sentencedBy = {
						SID = char:GetData('SID'),
						First = char:GetData('First'),
						Last = char:GetData('Last'),
						Callsign = char:GetData('Callsign'),
					}
				}

				for k, v in ipairs(suspectList) do
					if v.suspect and v.suspect.SID == data.data.suspect.SID then
						suspectList[k].sentence = sentenceData
						break
					end
				end
				suspects.suspect = suspectList

				local reportUpdated = Database:Update('mdt_reports', { ID = data.report }, { suspects = suspects })
				if not reportUpdated or reportUpdated == 0 then
					_editingReports[data.report] = nil
					cb(false)
					return
				end

				sentencedSuspects[data.report][data.data.suspect.SID] = true

				local existingConvictions = Database:FindOne('character_convictions', { SID = data.data.suspect.SID })
				if existingConvictions then
					local charges = existingConvictions.Charges or {}
					local convictions = existingConvictions.Convictions or {}
					for _, charge in ipairs(data.data.charges) do
						table.insert(charges, charge)
					end
					table.insert(convictions, {
						time = os.time() * 1000,
						report = data.report,
						fine = data.fine,
						jail = data.jail,
						parole = data.parole,
					})
					Database:Update('character_convictions', { SID = data.data.suspect.SID }, {
						Charges = json.encode(charges),
						Convictions = json.encode(convictions),
					})
				else
					Database:Insert('character_convictions', {
						SID = data.data.suspect.SID,
						Charges = json.encode(data.data.charges),
						Convictions = json.encode({
							{
								time = os.time() * 1000,
								report = data.report,
								fine = data.fine,
								jail = data.jail,
								parole = data.parole,
							}
						}),
					})
				end

				if data.parole ~= nil then
					Database:Update('characters', { SID = data.data.suspect.SID }, { Parole = data.parole })
				end

				if data.sentence.revoke then
					local licenseUpdate = {}
					local needsUpdate = false
					for k, v in pairs(data.sentence.revoke) do
						if v then
							needsUpdate = true
							if k == 'drivers' then
								licenseUpdate['Licenses_Drivers_Active'] = false
								licenseUpdate['Licenses_Drivers_Suspended'] = true
							elseif k == 'weapons' then
								licenseUpdate['Licenses_Weapons_Active'] = false
								licenseUpdate['Licenses_Weapons_Suspended'] = true
							elseif k == 'hunting' then
								licenseUpdate['Licenses_Hunting_Active'] = false
								licenseUpdate['Licenses_Hunting_Suspended'] = true
							elseif k == 'fishing' then
								licenseUpdate['Licenses_Fishing_Active'] = false
								licenseUpdate['Licenses_Fishing_Suspended'] = true
							end
						end
					end

					if needsUpdate then
						Database:Update('characters', { SID = data.data.suspect.SID }, licenseUpdate)
						local updatedChar = Database:FindOne('characters', { SID = data.data.suspect.SID })
						if updatedChar and updatedChar.Licenses then
							local plyr = Fetch:SID(updatedChar.SID)
							if plyr then
								local plyrChar = plyr:GetData('Character')
								if plyrChar then
									plyrChar:SetData('Licenses', updatedChar.Licenses)
								end
							end
						end
					end
				end

				GlobalState["MDT:Metric:Arrests"] = GlobalState["MDT:Metric:Arrests"] + 1

				cb(true)
				_editingReports[data.report] = nil
			else
				cb(false)
			end

		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:RevokeLicenseSuspension", function(source, data, cb)
		local char = Fetch:Source(source):GetData("Character")

		if CheckMDTPermissions(source, true) then
			local licenseUpdate = {}
			local canUpdate = false

			for k, v in pairs(data.unsuspend) do
				if v then
					canUpdate = true

					licenseUpdate[string.format('Licenses_%s_Active', k)] = false
					licenseUpdate[string.format('Licenses_%s_Suspended', k)] = false

					if k == 'Drivers' then
						licenseUpdate['Licenses_Drivers_Active'] = true
						licenseUpdate['Licenses_Drivers_Points'] = 0
					end
				end
			end

			if canUpdate then
				local existing = Database:FindOne('characters', { SID = data.SID })
				local rawHistory = existing and existing.MDTHistory
				local history = type(rawHistory) == 'table' and rawHistory or {}
				table.insert(history, {
					Time = (os.time() * 1000),
					Char = char:GetData("SID"),
					Log = string.format(
						"%s Updated Profile, Revoked License Suspensions %s",
						char:GetData("First") .. " " .. char:GetData("Last"),
						json.encode(data.unsuspend)
					),
				})
				licenseUpdate.MDTHistory = history

				Database:Update('characters', { SID = data.SID }, licenseUpdate)
				local results = Database:FindOne('characters', { SID = data.SID })
				if results and results.SID and results.Licenses then
					local plyr = Fetch:SID(results.SID)
					if plyr then
						local plyrChar = plyr:GetData('Character')
						if plyrChar then
							plyrChar:SetData('Licenses', results.Licenses)
						end
					end
					cb(results.Licenses)
				else
					cb(false)
				end
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:ClearCriminalRecord", function(source, data, cb)
		local char = Fetch:Source(source):GetData("Character")

		if char and CheckMDTPermissions(source, true) then
			local old = Database:FindOne('character_convictions', { SID = data.SID })
			if old then
				old._id = nil
				old.Time = os.time()
				old.ClearedBy = char:GetData("SID")

				local inserted = Database:Insert('character_convictions_expunged', old)
				if inserted then
					local affected = Database:Delete('character_convictions', { SID = data.SID })
					cb(affected and affected > 0)
				else
					cb(false)
				end
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:OpenEvidenceLocker", function(source, caseNum, cb)
		local myDuty = Player(source).state.onDuty
		if myDuty and (myDuty == "police" or myDuty == "government") then
			Callbacks:ClientCallback(source, "Inventory:Compartment:Open", {
				invType = 44,
				owner = ("evidencelocker:%s"):format(caseNum),
			}, function()
				Inventory:OpenSecondary(source, 44, ("evidencelocker:%s"):format(caseNum))
			end)
		end
	end)

	Callbacks:RegisterServerCallback("MDT:OpenPersonalLocker", function(source, data, cb)
		local char = Fetch:Source(source):GetData('Character')
		if char and (Jobs.Permissions:HasJob(source, 'police') or Jobs.Permissions:HasJob(source, 'ems')) and char:GetData('Callsign') then
			cb(true)

			Callbacks:ClientCallback(source, "Inventory:Compartment:Open", {
				invType = 45,
				owner = ("pdlocker:%s"):format(char:GetData('SID')),
			}, function()
				Inventory:OpenSecondary(source, 45, ("pdlocker:%s"):format(char:GetData('SID')))
			end)
		else
			cb(false)
		end
	end)
end)
