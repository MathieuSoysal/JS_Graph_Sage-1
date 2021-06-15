#Your path to the repository JS_Graph_Sage
path_To_Project_Repo = 'Mes Documents/Git'
print('Files not found')
def _update_JS_Repo(path) :
	global path_To_Project_Repo
	if path != "1" :
		path_To_Project_Repo = str(path)


# #Your path to the repository where you'll save the JSON version of the graphs (for example JS_Graph_Sage/obj)
# path_To_JSON_Repo = 'Mes Documents/Git/JS_Graph_Sage/obj/'
# def _update_JSON_Repo(path) :
# 	global path_To_JSON_Repo
# 	path_To_JSON_Repo = str(path)
# #Default name of the JSON file
# JSON_name = 'Graph_JSON'
# def _update_JSON_name(name) :
# 	global JSON_name
# 	JSON_name = name



_update_JS_Repo(input('Please enter the path to the repository containing the project : '))

# _update_JSON_Repo(path_To_Project_Repo+'/JS_Graph_Sage/obj/')

try:
	attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/customJsGraph.py')
	attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/update.py')
	attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/tests.py')
	attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/websocket_server.py')
	attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/connection.py')
	attach(path_To_Project_Repo+'/JS_Graph_Sage/src/Python/request_handler.py')
except:
	print('Files not found')
