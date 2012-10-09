# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'livereload' do
  watch( %r{.+/(.+\.css|js)} ) { |m| "/assets_path/#{m[1]}" } # EDIT HERE
  watch( %r{.+\.html} )
end
