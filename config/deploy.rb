set :application, "twitrack"
set :repository,  "ssh://git@tools:222/twitrack.git"

set :scm, :git

set :nodepath, "/var/www/apps/twitrack/shared/bin/node"

role :app, "slice5"

namespace :deploy do
  task :start do
    run "/usr/bin/nohup #{nodepath} #{current_path}/server.js > #{shared_path}/log/run.log &"
  end
  task :stop do
    run "/usr/bin/pkill -f #{nodepath}"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    #run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
