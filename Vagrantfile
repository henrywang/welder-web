# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"
# Default CPU and Memory configurations.
VM_CPUS = 2       # Physical CPUs
VM_MEMORY = 2048  # Megabytes

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

    config.vm.define "fedora28", primary: true do |c|
        c.vm.box = "fedora/28-cloud-base"
        c.vm.synced_folder ".", "/vagrant", disabled: true
        c.vm.synced_folder "./public", "/usr/share/cockpit/welder", type: "rsync", create: true, rsync__args: ["--verbose", "--archive", "--delete", "-z"]
        c.vm.network "private_network", ip: "192.168.50.10"
        c.vm.network "forwarded_port", guest: 9090, host: 9090
        c.vm.hostname = "welder-web-devel"
        c.vm.post_up_message = "You can now access Composer UI at https://localhost:9090/welder (login as 'root' with password 'foobar')"

        c.vm.provider "libvirt" do |libvirt|
            libvirt.memory = VM_MEMORY
            libvirt.cpus = VM_CPUS
            libvirt.cpu_mode = "host-model"
        end

        c.vm.provider "virtualbox" do |virtualbox|
            virtualbox.memory = VM_MEMORY
            virtualbox.cpus = VM_CPUS
        end

        c.vm.provision "shell", inline: <<-SHELL
            set -eu
            dnf update -y
            dnf install -y util-linux-user   # for chfn
            echo foobar | passwd --stdin root
            getent passwd admin >/dev/null || useradd -c Administrator -G wheel admin
            echo foobar | passwd --stdin admin
            usermod -a -G wheel vagrant
            chfn -f Vagrant vagrant
            # disable selinux for lorax-composer
            setenforce 0
            sed -i 's/SELINUX=\(enforcing\|permissive\)/SELINUX=disabled/g' /etc/selinux/config

            dnf install -y cockpit lorax-composer
            systemctl enable cockpit.socket
            systemctl start cockpit.socket
            systemctl enable lorax-composer
            systemctl start lorax-composer
            systemctl daemon-reload
        SHELL
    end

    config.vm.define "selenium-linux", primary: true do |selenium|
        selenium.vm.box = "fedora/28-cloud-base"
        selenium.vm.network "private_network", ip: "192.168.50.20"
        selenium.vm.network "forwarded_port", guest: 4444, host: 4444
        selenium.vm.network "forwarded_port", guest: 5900, host: 5900
        selenium.vm.network "forwarded_port", guest: 5901, host: 5901
        selenium.vm.hostname = "selenium-linux"
        selenium.vm.post_up_message = "You can now access firefox and chrome browser by vnc viewer with password secret on port 5900 and 5901"

        selenium.vm.provider "libvirt" do |libvirt|
            libvirt.memory = VM_MEMORY
            libvirt.cpus = VM_CPUS
            libvirt.cpu_mode = "host-model"
        end

        selenium.vm.provider "virtualbox" do |virtualbox|
            virtualbox.memory = VM_MEMORY
            virtualbox.cpus = VM_CPUS
        end

        selenium.vm.provision "shell", inline: <<-SHELL
            set -eu
            TICKS=120
            function wait_curl(){
                LINK=$1
                GREP_CMD=$2
                FOUND=""
                FULLLINK="http://localhost:4444$LINK"
                for foo in `seq $TICKS`; do
                    if curl -s --connect-timeout 1 $FULLLINK | grep "$GREP_CMD" >/dev/null; then
                        echo "$FULLLINK ('$GREP_CMD' available on page)" >&2
                        FOUND="yes"
                        break
                    else
                        sleep 0.5
                    fi
                done
                if [ -z "$FOUND" ]; then
                    echo "ERROR: $FULLLINK ('$GREP_CMD' not available)" >&2
                    return 1
                fi
            }

            dnf update -y
            # disable selinux for lorax-composer
            setenforce 0
            sed -i 's/SELINUX=\(enforcing\|permissive\)/SELINUX=disabled/g' /etc/selinux/config
            # install docker
            dnf remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine
            dnf -y install dnf-plugins-core
            dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            dnf install docker-ce

            systemctl enable docker
            systemctl start docker
            systemctl daemon-reload

            docker run -d -p 4444:4444 --name selenium-hub --restart=always selenium/hub:3
            wait_curl /grid/console "Grid Console"
            docker run -d -P -p 5900:5900 --link selenium-hub:hub --restart=always --shm-size=512M selenium/node-chrome-debug:3.14.0-europium
            wait_curl /grid/console "browserName: chrome"
            docker run -d -P -p 5901:5900 --link selenium-hub:hub --restart=always --shm-size=512M selenium/node-firefox-debug:3.14.0-europium
            wait_curl /grid/console "browserName: firefox"
        SHELL
    end
end