from livereload import Server
server = Server()
server.watch('*.html')
server.serve(port=8000)
