bl_info = {
    "name": "Group Objects",
    "description": "Group the selected objects into an empty node",
    "author": "Clément Cariou",
    "version": (0, 0, 1),
    "blender": (2, 80, 0),
    "category": "Development"
}

import bpy

class GroupObjects(bpy.types.Operator):
    """Operator metadata"""
    bl_idname = "object.group_objects"
    bl_label = "Group the selected objects into an empty node"
    bl_options = {'REGISTER', 'UNDO'}

    @classmethod
    def poll(cls, context):
        return (context.mode == 'OBJECT')

    def invoke(self, context, event):
        self.execute(context)
        return {'FINISHED'}

    def execute(self, context):
        objs = bpy.context.selected_objects
        if len(objs) < 2:
            return {'FINISHED'}
        bpy.ops.view3d.snap_cursor_to_selected()
        bpy.ops.object.empty_add(type='PLAIN_AXES', location=bpy.context.scene.cursor.location)
        empty = bpy.context.selected_objects[0]
        for obj in objs:
            obj.select_set(obj.parent == None)
        bpy.context.view_layer.objects.active = empty
        bpy.ops.object.parent_set(type='OBJECT', keep_transform=False)
        for obj in objs:
            obj.select_set(False)
        return {'FINISHED'}


def register():
    bpy.utils.register_class(GroupObjects)


def unregister():
    bpy.utils.unregister_class(GroupObjects)


if __name__ == "__main__":
    register()
