#!/usr/bin/python3
import os
import sys
import pyinotify
import subprocess
from selenium import webdriver

# #hate to use so many globals, but the following code was throwing a broken pipe exception
# a = webdriver.Firefox()
# b = a
# b.refresh()
# # but this would not:
# a.refresh()


cur_dir = os.path.dirname(os.path.realpath(__file__))
src_dir = os.path.abspath(os.path.join(cur_dir, os.pardir,'src'))
browser = None

def src_watch(on_change, watch_dir="src/"):
    global browser
    wm = pyinotify.WatchManager()  # Watch Manager
    mask = pyinotify.IN_MODIFY  # watched events

    class EventHandler(pyinotify.ProcessEvent):
        def process_IN_MODIFY(self, event):
            on_change()
            refresh_browser()
    handler = EventHandler()
    notifier = pyinotify.Notifier(wm, handler)
    wdd = wm.add_watch(watch_dir, mask, rec=True)
    print("[Watching %s]" % watch_dir)
    notifier.loop()
    print("[Stopped watching]")

def start_browser(url=None):
    driver = webdriver.Firefox()
    if url:
        driver.get(url)
    return driver

def on_change():
    print("[Watch triggered]")
    global broswer
    script_path = os.path.abspath(os.path.join(cur_dir, 'rem_install.bash'))
    user = 'root'
    remote_host = '%s@%s' % (user,sys.argv[1])
    subprocess.call([script_path,remote_host])
    browser.refresh()

def pause_and_prompt():
    try:
        print("[Paused]\nPress Enter to resume or Ctrl-c again to exit")
        ret = input()
        return True
    except KeyboardInterrupt:
        return False

def main():
    global browser
    if len(sys.argv) < 2:
        print("Please provide host")
    keep_watching = True
    host = sys.argv[1]
    browser = start_browser(url="http://%s:9090" % host)
    while keep_watching:
        src_watch(on_change, src_dir)
        keep_watching = pause_and_prompt()

def deb():
    cur_dir = os.path.dirname(os.path.realpath(__file__))
    src_dir = os.path.abspath(os.path.join(cur_dir, os.pardir,'src'))
    print(src_dir)

if __name__ == '__main__':
    main()
