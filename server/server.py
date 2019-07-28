from http.server import HTTPServer, BaseHTTPRequestHandler
import tensorflow as tf

X = []
Y = []

def save_object(obj, filename):
    with open(filename, 'wb') as output:  # Overwrites any existing file.
        pickle.dump(obj, output, pickle.HIGHEST_PROTOCOL)

class RequestHandler(BaseHTTPRequestHandler):

    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        BaseHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        if(self.path == "/favicon.ico"):
            self.send_response(404)
            self.end_headers()
            return
        if(self.path == "/save"):
            save_object(X, 'X.pkl')
            save_object(Y, 'Y.pkl')
        state = [int(i) for i in self.path.split('?')[1].split(';')[0].split(',')]
        actions = [int(i) for i in self.path.split('?')[1].split(';')[1].split(',')]
        X.append(state)
        Y.append(actions)
        print(str(state) + " -> " + str(actions))


httpd = HTTPServer(('localhost', 4000), RequestHandler)
try:
    print("Serving starting on port 4000")
    httpd.serve_forever()
except KeyboardInterrupt:
    print("Server Closing . . .")