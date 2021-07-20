import os
import ujson

def walk(top, structure, dir):

    extend = ""
    if top != "":
        extend = extend + "/"
        
    item_index = 0
    structure[dir] = {}
    
    # Loop through and create stucture of on-board FS
    for dirent in os.listdir(top):
        if(os.stat(top + extend + dirent)[0] == 32768):
            structure[dir][item_index] = {"FILE": dirent}
            item_index = item_index + 1
        elif(os.stat(top + extend + dirent)[0] == 16384):
            structure[dir][item_index] = {"DIR": dirent}
            item_index = item_index + 1
            walk(top + extend + dirent, structure[dir], dirent)
    return structure
struct = {}
print(ujson.dumps(walk("", struct, "")))