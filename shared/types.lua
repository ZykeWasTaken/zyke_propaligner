---@class PresetData
---@field prop string
---@field bone number
---@field dict string
---@field clip string
---@field offset Vector3Array
---@field rotation Vector3Array
---@field created integer

---@class Preset
---@field id string
---@field label string
---@field data PresetData

---@class ExportData
---@field prop string
---@field bone number
---@field dict string
---@field clip string
---@field offset Vector3Array
---@field rotation Vector3Array

-- Is the exact same as Preset, without an id since that will be created
-- created is also not included, since that will be inserted when it is imported
---@class Export
---@field label string
---@field data ExportData

---@class HistoryData
---@field prop string
---@field bone number
---@field dict string
---@field clip string
---@field offset Vector3Array
---@field rotation Vector3Array
---@field created OsTime

---@class AlignmentData
---@field prop string
---@field bone integer
---@field dict string
---@field clip string
---@field offset vector3 | Vector3Table
---@field rotation vector3 | Vector3Table

---@alias OsTime integer
---@alias Vector3Table table{x: number, y: number, z: number}
---@alias Vector3Array [number, number, number]
---@alias PlayerId integer
---@alias Success boolean
---@alias JSON string