set :application, "twitrack"
set :repository,  "ssh://git@tools:222/twitrack.git"
set :deploy_to, "/var/www/apps/#{application}"
set :deploy_via, :remote_cache
set :use_sudo, false

set :scm, :git

set :nodepath, "/var/www/apps/twitrack/shared/bin/node"

set :port, 222
set :user, 'deployer'

set :gateway, "tools"

role :app, "slice5:222"

namespace :deploy do
  task :start do
    run "SOCKPATH=/var/www/apps/twitrack/shared/server.sock TWITTER_BASIC=dGFmMjp0b2RkY2hhb3Mx /usr/bin/nohup #{nodepath} #{current_path}/server.js > #{shared_path}/log/run.log &"
  end
  task :stop do
    run "/usr/bin/pkill -f #{nodepath}"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    #run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
