require 'json'

$dir_regex = %r{^\w+$}
$file_regex = %r{^[^\.]+\.\w{0,4}$}

$files = []

def search(path)
  Dir.foreach(path) do |item|
    if item =~ $file_regex
      $files.push "#{path}/#{item}"
    end

    if item =~ $dir_regex
      search "#{path}/#{item}"
    end
  end
end

search 'images'
puts $files.to_json
