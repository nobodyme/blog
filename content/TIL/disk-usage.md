Had to debug a production outage today, 
Checking the httpd logs, figured the outage is due to 100% disk utilization, and server has gone for a graceful shutdown.
Examining the disk usage via `df -h`, showed the root volume at 100%

Looking into root volume, however
`du -h --max-depth=1`

- /usr - 13G
- /opt - 5.8G
- /lib64 - 1.9G
- /var - 3.6G
- /root - 1.2G
- /etc - 1.2G
- /bin - 359M
- /boot - 310M
- /run - 189M
- /home - 2.2M

We found that everything was well below the limit.
This was no where near 100%

Why does df show, the `/` is at 100%?

Turns out that processes still hold memory, if the file they're using/opened has been deleted while the process is still running.

To identify such processes, the `lsof +L1` command can be used. 
In this particular case, we had recently deleted a large log file of over 50G, but the process was still holding onto it. Once we identified the process and restarted it, the disk utilization returned to expected levels.
