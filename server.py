# Connect to this at https://127.0.0.1/

# https://gist.github.com/stephenbradshaw/a2b72b5b58c93ca74b54f7747f18a481

#!/usr/bin/env python3
# python3 update of https://gist.github.com/dergachev/7028596
# Create a basic certificate using openssl: 
#     openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
# Or to set CN, SAN and/or create a cert signed by your own root CA: https://thegreycorner.com/pentesting_stuff/writeups/selfsignedcert.html


import http.server
import ssl

# https://stackoverflow.com/questions/21956683/enable-access-control-on-simple-http-server
# https://gist.github.com/ricardojba/f40ea7154d99fdba3c7a0b19de68b2cc

# https://hcmc.uvic.ca/blogs/index.php/python-simple-server-for-testing-complex-sites?blog=11
class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_response(self, *args, **kwargs):
        http.server.SimpleHTTPRequestHandler.send_response(self, *args, **kwargs)
        self.send_header('Access-Control-Allow-Origin', '*')

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
        # self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super(CORSRequestHandler, self).end_headers()

httpd = http.server.HTTPServer(('127.0.0.1', 443), CORSRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./dummy.pem', server_side=True)
httpd.serve_forever()